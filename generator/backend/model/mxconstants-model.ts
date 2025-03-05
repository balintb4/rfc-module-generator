export class Constants {
    appName: string | null;
    token: string | null;
    client: string | null;
    destinationName: string | null;
    host: string | null;
    language: string | null;
    password: string | null;
    routerAddress: string | null;
    sapReleaseVersion: string | null;
    systemNumber: string | null;
    username: string | null;

    constructor(
        appName: string | null = null,
        token: string | null = null,
        client: string | null = null,
        destinationName: string | null = null,
        host: string | null = null,
        language: string | null = null,
        password: string | null = null,
        routerAddress: string | null = null,
        sapReleaseVersion: string | null = null,
        systemNumber: string | null = null,
        username: string | null = null
    ) {
        this.appName = appName;
        this.token = token;
        this.client = client;
        this.destinationName = destinationName;
        this.host = host;
        this.language = language;
        this.password = password;
        this.routerAddress = routerAddress;
        this.sapReleaseVersion = sapReleaseVersion;
        this.systemNumber = systemNumber;
        this.username = username;
    }
}
