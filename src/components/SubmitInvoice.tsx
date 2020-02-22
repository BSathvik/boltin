import * as React from 'react';
import { InvoiceAPI } from '../api/InvoiceAPI';
import copy from 'copy-to-clipboard';

const tryMeInvoice = `lnbc58u1p0rx65fpp5sux6u3tvwqeh3uze7v6\
t0evrvz8sk3eag2xfft6sgmez2quzj5nsdq4fpskce3qvysxxmm0dd5k2cq\
zpgxq9zsgrjfppqc9yhyhtg65922gumf6kjdwhavzy6x3wenhhf5ndf8vhg\
5r2e2z82espxk0aadjpsd930arzkjm73lnaa5fdjmkqn69kyt2hkvte6dcq\
6caa9veeag0dg5jsk5ukm89zwucp4xhspqqfgas`;

export interface SubmitInvoiceProps {}

export interface SubmitInvoiceState {
    invoice: string;
    url?: string;
    error?: string;
}

export default class SubmitInvoice extends React.Component<SubmitInvoiceProps, SubmitInvoiceState> {

    constructor(props: SubmitInvoiceProps) {
        super(props);
        this.state = { invoice: "" };
        this.onSubmit = this.onSubmit.bind(this);
        this.onInvoiceChange = this.onInvoiceChange.bind(this);
    }

    async onSubmit() {
        if (!this.state.invoice || this.state.invoice.substr(0, 2) !== "ln") {
            this.setState({ error: "Invalid invoice" })
            return;
        }
        const postReq = await InvoiceAPI.postInvoice(this.state.invoice.trim());
        if (postReq.data) {
            this.setState({ url: postReq.data, error: undefined });
        } else {
            this.setState({ url: undefined, error: postReq.err });
        }
    }

    onInvoiceChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        this.setState({ invoice: e.target.value });
    }

    render() {
        const url = this.state.url;
        return (
            <div className="si-content">
                <h1 className="si-title">Boltin</h1>
                <h4 className="si-sub-title">
                    Enter your lightning network invoice to get a short URL that you can share
                </h4>

                <textarea
                    className="si-input"
                    onChange={this.onInvoiceChange}
                    placeholder="Lightning Invoice"
                    value={this.state.invoice}
                />
    
                <button className="si-btn-submit" onClick={this.onSubmit}>
                    Submit
                </button>

                <div className="si-url">
                        <div>Don't have an invoice?</div>
                        <button 
                            className="si-copy si-try"
                            onClick={() => this.setState({ invoice: tryMeInvoice })}>Try me!
                        </button>
                </div>

                <div className="si-url">
                    {url ? 
                    <div>
                        <a href={url}> {url}</a>
                        <button className="si-copy" onClick={() => copy(url)}>Copy!</button>
                    </div> : 
                    this.state.error}
                </div>
            </div>
        );
    }
}
