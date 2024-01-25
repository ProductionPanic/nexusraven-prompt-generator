export interface NexusRavenFunction {
    id: UUID;
    functionName: string;
    description: string;
    expanded?: boolean;
    returns: {
        type: string;
        description: string;
    }
    parameters: {
        name: string;
        type: string;
        description: string;
    }[]
}

export type UUID = string
