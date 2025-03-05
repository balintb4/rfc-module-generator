export class ConfigTokenAndName {
    private static token: string | null;
    private static moduleName: string | null;

    public static setConfigTokenAndName(newToken: string | null, newModuleName: string | null): void {
        this.token = newToken;
        this.moduleName = newModuleName;
    }

    public static getConfigTokenAndName(): { token: string | null, moduleName: string | null } {
        return { token: this.token, moduleName: this.moduleName };
    }
}