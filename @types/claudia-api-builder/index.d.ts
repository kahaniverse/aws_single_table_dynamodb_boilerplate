declare module 'claudia-api-builder' {
    import {
        Context as LambdaContext,
        APIGatewayProxyEvent as AwsProxy
    } from "aws-lambda";

    interface Constructor_Options {
        logger?: Logger,
        prompter?: Prompter,
        mergeVars?: boolean,
        requestFormat?: RequestFormat,
    }

    type Logger = (message?: any, ...messages: any[]) => void;

    type Prompter = (question: string) => Promise<void>;

    type RequestFormat = 'AWS_PROXY' | 'CLAUDIA_API_BUILDER';

    interface ApiConfig {
        version: number,
        routes: ApiConfig_Routes | {},
        corsHandlers?: boolean,
        corsHeaders?: string,
        corsMaxAge?: number,
        authorizers?: ApiConfig_Authorizers,
        binaryMediaTypes: string[],
        customResponses?: ApiConfig_CustomResponses,
    }

    interface ApiConfig_Routes {
        [name: string]: { [methods in ApiConfig_Routes_Methods]: Object },
    }

    type ApiConfig_Routes_Methods = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';

    interface ApiConfig_Authorizers {
        [name: string]: RegisterAuthorizer_Options,
    }

    type ApiConfig_CustomResponses = {
        [name: string]: SetGatewayResponse_Config,
    };

    type AddPostDeployStep_Function = (
        commandLineOptions: PostDeploy_Options,
        lambdaProperties: PostDeploy_LambdaDetails,
        utils: PostDeploy_Utils,
    ) => Promise<object | string> | object | string;

    interface PostDeploy_Options {
        [key: string]: undefined | string | string[] | number | boolean,
    }

    interface PostDeploy_LambdaDetails {
        name: string,
        alias: string,
        apiId: string,
        apiUrl: string,
        region: string,
        apiCacheReused: boolean,
    }

    // TODO Types unavailable for these.
    interface PostDeploy_Utils {
        apiGatewayPromise: any;
        aws: any;
        Promise?: any;
    }

    type RegisterAuthorizer_Options =
        RegisterAuthorizer_Options_NameVer
        | RegisterAuthorizer_Options_Arn
        | RegisterAuthorizer_Options_ProviderARNs;

    interface RegisterAuthorizer_Options_NameVer extends RegisterAuthorizer_Options_Optional {
        lambdaName: string,
        lambdaVersion: string | number | boolean,
    }

    interface RegisterAuthorizer_Options_Arn extends RegisterAuthorizer_Options_Optional {
        lambdaArn: string,
    }

    interface RegisterAuthorizer_Options_ProviderARNs extends RegisterAuthorizer_Options_Optional {
        providerARNs: string[],
    }

    interface RegisterAuthorizer_Options_Optional {
        headerName?: string,
        identitySource?: string,
        validationExpression?: string,
        credentials?: string,
        resultTtl?: number,
        type?: RegisterAuthorizer_Options_Optional_Type,
    }

    // If "providerARNs", set to "COGNITO_USER_POOLS". Otherwise set to "TOKEN".
    type RegisterAuthorizer_Options_Optional_Type = 'REQUEST' | 'TOKEN' | 'COGNITO_USER_POOLS';

    type SetGatewayResponse_Type =
        'ACCESS_DENIED'
        | 'API_CONFIGURATION_ERROR'
        | 'AUTHORIZER_CONFIGURATION_ERROR'
        | 'AUTHORIZER_FAILURE'
        | 'BAD_REQUEST_PARAMETERS'
        | 'BAD_REQUEST_BODY'
        | 'DEFAULT_4XX'
        | 'DEFAULT_5XX'
        | 'EXPIRED_TOKEN'
        | 'INTEGRATION_FAILURE'
        | 'INTEGRATION_TIMEOUT'
        | 'INVALID_API_KEY'
        | 'INVALID_SIGNATURE'
        | 'MISSING_AUTHENTICATION_TOKEN'
        | 'QUOTA_EXCEEDED'
        | 'REQUEST_TOO_LARGE'
        | 'RESOURCE_NOT_FOUND'
        | 'THROTTLED'
        | 'UNAUTHORIZED'
        | 'UNSUPPORTED_MEDIA_TYPE'
        | 'WAF_FILTERED';

    interface SetGatewayResponse_Config {
        statusCode?: number | string,
        headers?: { [name: string]: string },
        responseParameters?: { [name: string]: string },
        responseTemplates?: { [name: string]: string },
        defaultResponse?: boolean,
    }

    interface Request_ClaudiaApiBuilder {
        v: number,
        rawBody: string,
        normalizedHeaders: { [name: string]: string },
        lambdaContext: LambdaContext,
        proxyRequest: Request_AwsProxy,
        queryString: { [name: string]: string } | {},
        env: { [name: string]: string },
        headers: { [name: string]: string },
        pathParams: { [name: string]: string } | {},
        body: string | JSON | Buffer,
        context: {
            method: Request_ClaudiaApiBuilder_Context_Method,
            path: string,
            stage: string,
            sourceIp: string,
            accountId: string | null,
            user: string | null,
            userAgent: string | null,
            userArn: string | null,
            caller: string | null,
            apiKey?: string,
            authorizerPrincipalId: string | null,
            cognitoAuthenticationProvider: string | null,
            cognitoAuthenticationType: string | null,
            cognitoIdentityId: string | null,
            cognitoIdentityPoolId: string | null,
        },
    }

    // Fix: Not shown in "APIGatewayProxyEvent" interface.
    interface Request_AwsProxy extends AwsProxy {
        protocol: string,
    }

    type Request = (request: Request_ClaudiaApiBuilder) => Promise<any> | any;

    type Request_ClaudiaApiBuilder_Context_Method = 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';

    interface Options {
        error?: number | {
            code?: number,
            contentType?: string,
            headers?: { [name: string]: string },
        },
        success?: number | {
            code?: number,
            contentType?: string,
            headers?: { [name: string]: string },
            contentHandling?: Options_ContentHandling,
        },
        apiKeyRequired?: boolean,
        authorizationType?: Options_AuthorizationType,
        invokeWithCredentials?: boolean | string,
        cognitoAuthorizer?: string,
        authorizationScopes?: string[],
        customAuthorizer?: string,
        requestContentHandling?: Options_ContentHandling,
        requestParameters?: {
            querystring?: object,
            header?: object,
        },
    }

    type Options_ContentHandling = 'CONVERT_TO_BINARY' | 'CONVERT_TO_TEXT';

    type Options_AuthorizationType = 'AWS_IAM';

    class ApiResponse {
        public constructor(body: string | object, header: object, httpCode: number);
    }

    class ApiBuilder {
        proxyRouter(arg0: { requestContext: { resourcePath: string; httpMethod: string; }; queryStringParameters?: any; stageVariables?: any; pathParameters?: any; body?: any;}, spy: void) ;
        public constructor(options?: Constructor_Options);

        public apiConfig(): ApiConfig;

        public corsOrigin(handler?: Request | string): void;

        public corsHeaders(headers: string): void;

        public corsMaxAge(age: number): void;

        // Usage: "new ApiBuilder.ApiResponse".
        public static ApiResponse: typeof ApiResponse;

        // Usage: "new api.ApiResponse".
        public ApiResponse: typeof ApiResponse; // Depreciated.

        public intercept(callback: Request): void;

        public addPostDeployStep(stepName: string, stepFunction: AddPostDeployStep_Function): void;

        public addPostDeployConfig(stageVarName: string, prompt: string, configOption: string): void;

        public registerAuthorizer(name: string, options: RegisterAuthorizer_Options): void;

        public setBinaryMediaTypes(types?: string[] | boolean): void;

        public setGatewayResponse(responseType: SetGatewayResponse_Type, config: SetGatewayResponse_Config): void;

        public any(uri: string, callback: Request, options?: Options): void;

        public get(uri: string, callback: Request, options?: Options): void;

        public post(uri: string, callback: Request, options?: Options): void;

        public put(uri: string, callback: Request, options?: Options): void;

        public delete(uri: string, callback: Request, options?: Options): void;

        public head(uri: string, callback: Request, options?: Options): void;

        public patch(uri: string, callback: Request, options?: Options): void;
        
    }
    export = ApiBuilder;
}
