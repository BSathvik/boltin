import * as React from 'react';
import { RouteComponentProps } from "react-router-dom";
import * as qrcode from 'qrcode';
import copy from 'copy-to-clipboard';
import prettyMs from 'pretty-ms';

import { InvoiceData, InvoiceAPI } from '../api/InvoiceAPI';
import { formatTimestamp, formatFiat } from './Utils';

type RouteProps = {
    id: string;
}

export interface ViewInvoiceProps extends RouteComponentProps<RouteProps> {}

export interface ViewInvoiceState {
    invoiceData?: InvoiceData;
    error?: string;
    price?: number;
    qrcodeImageUrl?: any;
    timeRemaining: number;
    hasExpired: boolean;
}

export default class ViewInvoice extends React.Component<ViewInvoiceProps, ViewInvoiceState> {

    timer: NodeJS.Timeout | null = null;
    constructor(props: ViewInvoiceProps) {
        super(props);
        this.state = {
            timeRemaining: 0,
            hasExpired: false
        };
    }

    startTimer(expiryTime: number) {
        this.timer = setInterval(() => {
            const timeRemaining = Math.floor(expiryTime - (Date.now() / 1000));
            if (timeRemaining > 0) {
                this.setState({ timeRemaining })
            } else {
                this.stopTimer();
            }
        }, 1000);
      }

      stopTimer() {
        if (this.timer) {
            clearInterval(this.timer)
            this.setState({ timeRemaining: 0, hasExpired: true });
        }
      }

    async generateQR (text: string) {
        try {
            this.setState({ qrcodeImageUrl: await qrcode.toDataURL(text) });
        } catch (err) {
            console.error(err);
        }
    }

    async getBTCPrice(): Promise<number | undefined> {
        const resp = await fetch('https://blockchain.info/ticker', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) return;

        const data = await resp.json();
        return data["USD"]["15m"] as number;
    }

    hasExpired(expire_timestamp: number) {
        return (expire_timestamp - (Date.now() / 1000)) <= 0;
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    async componentDidMount() {
        const invoiceReq = await InvoiceAPI.getInvoiceFromID(this.props.match.params.id);
        if (invoiceReq.data) {
            this.setState({ invoiceData: invoiceReq.data });
            await this.generateQR(invoiceReq.data.invoice);

            const expire_time = invoiceReq.data.expire_timestamp;
            if (expire_time) {
                if (!this.hasExpired(expire_time)) this.startTimer(expire_time);
                else this.setState({ hasExpired: true });
            }
        } else {
            this.setState({ error: invoiceReq.err });
        }

        const price = await this.getBTCPrice();
        this.setState({ price })
    }

    render() {
        // Show error
        if (this.state.error) { 
            return (<h1>{this.state.error}</h1>);
        }

        const invoiceData = this.state.invoiceData;
        if (!invoiceData) return (null); // While loading

        return (
            <div className="vi-content">
                <h1 className="vi-title">Lightning Invoice</h1>
    
                {(this.state.hasExpired || this.state.timeRemaining > 0) &&
                <div className="vi-expire vi-copy">
                    {this.state.hasExpired ? "Invoice has expired" :
                        "Expires in: " + prettyMs(this.state.timeRemaining  * 1000)}
                </div>}

                {this.state.qrcodeImageUrl &&
                <img
                    className="vi-qrcode"
                    src={this.state.qrcodeImageUrl}
                    alt={"Could not generate QR Code"}
                />}
    
                <div className="vi-copy" onClick={() => copy(invoiceData.invoice)}>Copy!</div>
                <div className="vi-row vi-invoice">{invoiceData.invoice}</div>

                {invoiceData.btc &&
                <div className="vi-row">
                    <div className="vi-row-cell"><strong>Amount</strong></div>
                    <div className="vi-row-cell">
                        {invoiceData.btc} BTC 
                        {this.state.price &&
                        <div className="vi-fiat">
                            ({formatFiat(invoiceData.btc, this.state.price)})
                        </div>}
                    </div>
                </div>}

                {invoiceData.description &&
                <div className="vi-row">
                    <div className="vi-row-cell"><strong>Memo</strong></div>
                    <div className="vi-row-cell">{invoiceData.description}</div>
                </div>}
    
                <div className="vi-row">
                    <div className="vi-row-cell"><strong>Created</strong></div>
                    <div className="vi-row-cell">
                        {formatTimestamp(invoiceData.timestamp)}
                    </div>
                </div>

                {invoiceData.expire_timestamp &&
                <div className="vi-row">
                    <div className="vi-row-cell"><strong>Expiry Time</strong></div>
                    <div className="vi-row-cell">
                        {formatTimestamp(invoiceData.expire_timestamp)}
                    </div>
                </div>}

                {invoiceData.fallback_addr &&
                <div className="vi-row">
                    <div className="vi-row-cell"><strong>Fallback Address</strong></div>
                    <div className="vi-row-cell">{invoiceData.fallback_addr}</div>
                </div>}

            </div>
        );

    }
}
