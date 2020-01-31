export enum Network {
    MAINNET = 'bitcoin',
    TESTNET = 'testnet'
}

export interface InvoiceData {
    network: Network;
    invoice: string;
    pubKey: string;
    timestamp: number;
    btc?: number;
    expire_timestamp?: number;
    description?: string;
    fallback_addr?: string;
}

export interface ResponseData {
    data: InvoiceData;
}

export class InvoiceAPI {

    static API: string = 'https://boltin-api.bsat.workers.dev';
    static SITE: string = 'https://boltin.me';

    static async getInvoiceFromID (id: string): Promise<{data?: InvoiceData, err?: string}> {
        const resp = await fetch(`${this.API}/invoice/${id}`, {
            method: 'GET',
        });

        if (!resp.ok) {
            try {
                return {err: (await resp.json()).error};
            } catch (e) {
                return {err: "Invoice not found"};
            }
        }
    
        const data = await resp.json();

        const satToBTC = (sat: number) => (sat * 1.0) / Math.pow(10, 8);

        const findTag = (tagName: string) => data.tags ? data.tags.find((tag: any) => tag.tagName === tagName) : null;
        const description = findTag("description");
        const fallback_addr = findTag("fallback_address");
    
        return {
            data: {
                network: data.coinType === Network.MAINNET ? Network.MAINNET : Network.TESTNET,
                invoice: data.invoice as string,
                pubKey: data.payeeNodeKey as string,
                timestamp: data.timestamp as number,
                btc: data.satoshis ? satToBTC(data.satoshis): null,
                expire_timestamp: data.timeExpireDate as number | null,
                description: description? description.data : null,
                fallback_addr: fallback_addr? fallback_addr.data.address : null
            } as InvoiceData
        };
    }

    // returns url given the invoice
    static async postInvoice (invoice: string): Promise<{data?: string, err?: string}> {

        const resp = await fetch(`${this.API}/publish/`, {
            body: JSON.stringify({ invoice }),
            method: 'POST',
        });

        if (!resp.ok) {
            try {
                return {err: (await resp.json()).error};
            } catch (e) {
                return {err: "Invoice not valid"};
            }
        }

        const data = await resp.json();

        return {
            data: `${this.SITE}/${data.id}`
        };
    }

}
