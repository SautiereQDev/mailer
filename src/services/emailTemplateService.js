"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplateService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class EmailTemplateService {
    constructor() {
        this.cachedTemplates = new Map();
        this.initialized = false;
        this.templatesDir = path_1.default.join(process.cwd(), 'src', 'views', 'emails');
        // Register helpers
        handlebars_1.default.registerHelper('currentYear', () => new Date().getFullYear());
        handlebars_1.default.registerHelper('default', function (value, defaultValue) {
            return value ?? defaultValue;
        });
    }
    async initialize() {
        try {
            await this.registerPartials();
            await this.registerLayouts();
            this.initialized = true;
        }
        catch (e) {
            throw new Error('Failed to initialize email templates: ' + JSON.stringify(e));
        }
    }
    checkInitialized() {
        if (!this.initialized) {
            throw new Error('EmailTemplateService must be initialized before use');
        }
    }
    async registerLayouts() {
        const layoutsDir = path_1.default.join(this.templatesDir, 'layouts');
        const files = await promises_1.default.readdir(layoutsDir);
        for (const file of files) {
            if (path_1.default.extname(file) === '.hbs') {
                const layoutName = path_1.default.basename(file, '.hbs');
                const content = await promises_1.default.readFile(path_1.default.join(layoutsDir, file), 'utf-8');
                handlebars_1.default.registerPartial(layoutName, content);
            }
        }
    }
    async renderTemplate(name, data) {
        this.checkInitialized();
        try {
            const template = await this.getTemplate(name);
            const content = template(data);
            // Apply layout if it exists
            const layoutContent = handlebars_1.default.partials.main;
            if (layoutContent) {
                const layoutTemplate = handlebars_1.default.compile(layoutContent);
                return layoutTemplate({
                    ...data,
                    body: new handlebars_1.default.SafeString(content),
                });
            }
            return content;
        }
        catch (error) {
            throw new Error(`Failed to render email template: ${name} ; ${JSON.stringify(error)}`);
        }
    }
    async registerPartials() {
        const partialsDir = path_1.default.join(this.templatesDir, 'partials');
        const files = await promises_1.default.readdir(partialsDir);
        for (const file of files) {
            if (path_1.default.extname(file) === '.hbs') {
                const partialName = path_1.default.basename(file, '.hbs');
                const content = await promises_1.default.readFile(path_1.default.join(partialsDir, file), 'utf-8');
                handlebars_1.default.registerPartial(partialName, content);
            }
        }
    }
    async getTemplate(name) {
        this.checkInitialized();
        if (this.cachedTemplates.has(name)) {
            return this.cachedTemplates.get(name);
        }
        const templatePath = path_1.default.join(this.templatesDir, `${name}.hbs`);
        const content = await promises_1.default.readFile(templatePath, 'utf-8');
        const template = handlebars_1.default.compile(content);
        this.cachedTemplates.set(name, template);
        return template;
    }
}
exports.EmailTemplateService = EmailTemplateService;
// Create and export the service instance
const emailTemplateService = new EmailTemplateService();
// Initialize in the background
emailTemplateService.initialize().catch((e) => {
    throw e;
});
exports.default = emailTemplateService;
