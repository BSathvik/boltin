

import { InvoiceAPI, InvoiceData } from './InvoiceAPI';
import fetchMock from 'jest-fetch-mock';


const networkResp = {
    "coinType": "bitcoin",
    "complete": true,
    "millisatoshis": "5800000",
    "payeeNodeKey": "03a48ce536ac5f7c384e5dc860856672b8307e32c5e950285f52b0a26d06225185",
    "prefix": "lnbc58u",
    "recoveryFlag": 1,
    "satoshis": 5800,
    "signature": "9dee9a4da93b2e8a0d59508eacc026b3fbd6c8306962fe8c5696fd1fcfbda25b2dd813d16c45aaf662f3a6e01ac77a56673d43da8a4a16a72db3944ee603535e",
    "tags": [
        {
            "tagName": "payment_hash",
            "data": "870dae456c703378f059f334b7e583608f0b473d428c94af5046f22503829527"
        },
        {
            "tagName": "description",
            "data": "Half a cookie"
        },
        {
            "tagName": "min_final_cltv_expiry",
            "data": 40
        },
        {
            "tagName": "expire_time",
            "data": 2629746
        },
        {
            "tagName": "fallback_address",
            "data": {
                "code": 0,
                "address": "bc1qc9yhyhtg65922gumf6kjdwhavzy6x3weraax5r",
                "addressHash": "c149725d68d50aa5239b4ead26bafd6089a345d9"
            }
        }
    ],
    "timeExpireDate": 1583057659,
    "timestamp": 1580427913,
    "invoice": "lnbc58u1p0rx65fpp5sux6u3tvwqeh3uze7v6t0evrvz8sk3eag2xfft6sgmez2quzj5nsdq4fpskce3qvysxxmm0dd5k2cqzpgxq9zsgrjfppqc9yhyhtg65922gumf6kjdwhavzy6x3wenhhf5ndf8vhg5r2e2z82espxk0aadjpsd930arzkjm73lnaa5fdjmkqn69kyt2hkvte6dcq6caa9veeag0dg5jsk5ukm89zwucp4xhspqqfgas"
}

describe('postInvoice', () => {

    beforeEach(() => {
        fetchMock.resetMocks();
    })

    it('invalid invoice', async () => {
        fetchMock.mockReject((resp: Response) => 
            Promise.resolve(JSON.stringify({ error: "Invalid invoice" }))
        );
    
        const resp = await InvoiceAPI.postInvoice("invalid invoice");
        expect(resp.err).toEqual('Invoice not valid');
    });

    it('valid invoice', async () => {

        fetchMock.mockResponse((resp: Response) =>
            Promise.resolve(JSON.stringify({ id: "Duq4aOG5" }))
        );
    
        const resp = await InvoiceAPI.postInvoice("valid invoice");
        expect(resp.data).toEqual('https://boltin.me/Duq4aOG5');
    });

});

describe('getInvoiceFromID', () => {

    beforeEach(() => {
        fetchMock.resetMocks();
    })

    it('valid url or id', async () => {
        fetchMock.mockResponse((req: Request) => 
            Promise.resolve(JSON.stringify(networkResp))
        )

        let invoiceResp = await InvoiceAPI.getInvoiceFromID("Duq4aOG5");
        
        const invoiceData = invoiceResp.data as InvoiceData;

        expect(networkResp.complete).toBeTruthy();
        expect(invoiceData.invoice).toEqual(networkResp.invoice);
        expect(invoiceData.network).toEqual(networkResp.coinType);
        expect(invoiceData.timestamp).toEqual(networkResp.timestamp);
        expect(invoiceData.expire_timestamp).toEqual(networkResp.timeExpireDate);
        expect(invoiceData.fallback_addr).toEqual((networkResp.tags[4].data as any)["address"]);
        expect(invoiceData.description).toEqual(networkResp.tags[1].data);
    });

    it('invalid url or id', async () => {
        fetchMock.mockReject((resp: Response) => 
            Promise.resolve(JSON.stringify({ error: "Invalid invoice" }))
        );

        let invoiceResp = await InvoiceAPI.getInvoiceFromID("Duq4aOG5");
        expect(invoiceResp.err).toEqual('Invoice not found');
    });

});
