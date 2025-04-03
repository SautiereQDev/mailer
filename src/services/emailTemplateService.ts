import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import env from '@src/config';

export class EmailTemplateService {
  private readonly templatesDir: string;
  private readonly cachedTemplates = new Map<string, Handlebars.TemplateDelegate>();
  private initialized = false;

  public constructor() {
    this.templatesDir = path.join(
      process.cwd(),
      env.NODE_ENV === 'production' ? 'views/' : 'src/views/emails'
    );

    // Register helpers
    Handlebars.registerHelper('currentYear', () => new Date().getFullYear());
    Handlebars.registerHelper('default', function (value: unknown, defaultValue: unknown): unknown {
      return value ?? defaultValue;
    });
  }

  public async initialize(): Promise<void> {
    try {
      await this.registerPartials();
      await this.registerLayouts();
      this.initialized = true;
    } catch (e: unknown) {
      throw new Error('Failed to initialize email templates: ' + JSON.stringify(e));
    }
  }

  public async registerLayouts(): Promise<void> {
    const layoutsDir = path.join(this.templatesDir, 'layouts');
    const files = await fs.readdir(layoutsDir);

    for (const file of files) {
      if (path.extname(file) === '.hbs') {
        const layoutName = path.basename(file, '.hbs');
        const content = await fs.readFile(path.join(layoutsDir, file), 'utf-8');
        Handlebars.registerPartial(layoutName, content);
      }
    }
  }

  public async renderTemplate(name: string, data: object): Promise<string> {
    this.checkInitialized();
    try {
      const template = await this.getTemplate(name);
      const content = template(data);

      // Apply layout if it exists
      const layoutContent = Handlebars.partials.main as string;
      if (layoutContent) {
        const layoutTemplate = Handlebars.compile(layoutContent);
        return layoutTemplate({
          ...data,
          body: new Handlebars.SafeString(content),
        });
      }

      return content;
    } catch (error: unknown) {
      throw new Error(`Failed to render email template: ${name} ; ${JSON.stringify(error)}`);
    }
  }

  public async registerPartials(): Promise<void> {
    const partialsDir = path.join(this.templatesDir, 'partials');
    const files = await fs.readdir(partialsDir);

    for (const file of files) {
      if (path.extname(file) === '.hbs') {
        const partialName = path.basename(file, '.hbs');
        const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
        Handlebars.registerPartial(partialName, content);
      }
    }
  }

  public async getTemplate(name: string): Promise<Handlebars.TemplateDelegate> {
    this.checkInitialized();
    if (this.cachedTemplates.has(name)) {
      return this.cachedTemplates.get(name)!;
    }

    const templatePath = path.join(this.templatesDir, `${name}.hbs`);
    const content = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(content);
    this.cachedTemplates.set(name, template);
    return template;
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('EmailTemplateService must be initialized before use');
    }
  }
}

// Create and export the service instance
const emailTemplateService = new EmailTemplateService();
// Initialize in the background
emailTemplateService.initialize().catch((e: unknown) => {
  throw e;
});

export default emailTemplateService;
