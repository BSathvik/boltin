# Boltin

[boltin.me](https://boltin.me) is a website that shortens Bitcoin Lightning Network invoices (payment requests).

Typical Lightning invoice (253 chars):

>lnbc58u1p0rx65fpp5sux6u3tvwqeh3uze7v6t0evrvz8sk3eag2xfft6sgmez2quzj5nsdq4fpskce3qvysxxmm0dd5k2cqzpgxq9zsgrjfppqc9yhyhtg65922gumf6kjdwhavzy6x3wenhhf5ndf8vhg5r2e2z82espxk0aadjpsd930arzkjm73lnaa5fdjmkqn69kyt2hkvte6dcq6caa9veeag0dg5jsk5ukm89zwucp4xhspqqfgas

Typical Boltin URL (26 chars): https://boltin.me/wodzyIRs

## Running locally

Clone the repo, then run:

`npm install` installs dependencies

`npm start` serves the website on `localhost:3000`

`wrangler preview --watch` starts the workers preview

`npm test` runs tests

## Deploy to Workers

`npm run build` builds packages the website

`wrangler publish` publishes the application to worker


## How it works

[boltin.me](https://boltin.me) is made using React (TypeScript) and runs on Cloudflare workers. It makes API calls to [boltin-api](https://github.com/BSathvik/boltin-api) to post or retrieve an invoice. When posting an invoice [boltin-api](https://github.com/BSathvik/boltin-api) verifies the validity of the invoice (structure and signature), converts it into a 6-byte URL-safe-base64 string which is used as the key to store the invoice in KV. This key is given in the form of a URL to the user. When retrieving the invoice [boltin-api](https://github.com/BSathvik/boltin-api) uses the key to get the stored invoice from KV, decodes it into useful data to show the user.

## Problem

When using the lightning network to send or receive payments, the payee sends the payer an invoice that is typically very long. This is not an issue when trying to send lightning to a person that's next to you because you may scan a QR code off their phone or laptop depending on the lightning client they use. But when trying to send payments to another person online, the payee will typically be forced to text/email the invoice and the payer cannot see any information contained in the invoice (amount, expiry time, memo/description, on-chain fallback address, etc) until they open up their lightning client and paste the invoice. 

Boltin allows the payee to paste their invoice to get a very short URL that they can then share with the payer. On opening the link on any device, the payer will be able to see important information about the invoice as well as scan a QR (as opposed to copy-pasting). 

## Invoices to play around with

> lnbc2500u1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdq5xysxxatsyp3k7enxv4jsxqzpuaztrnwngzn3kdzw5hydlzf03qdgm2hdq27cqv3agm2awhz5se903vruatfhq77w3ls4evs3ch9zw97j25emudupq63nyw24cg27h2rspfj9srp

>lnbc20m1pvjluezhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqfppj3a24vwu6r8ejrss3axul8rxldph2q7z9kmrgvr7xlaqm47apw3d48zm203kzcq357a4ls9al2ea73r8jcceyjtya6fu5wzzpe50zrge6ulk4nvjcpxlekvmxl6qcs9j3tz0469gq5g658y

>lnbc20m1pvjluezhp58yjmdan79s6qqdhdzgynm4zwqd5d7xmw5fk98klysy043l2ahrqspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqfppqw508d6qejxtdg4y5r3zarvary0c5xw7kepvrhrm9s57hejg0p662ur5j5cr03890fa7k2pypgttmh4897d3raaq85a293e9jpuqwl0rnfuwzam7yr8e690nd2ypcq9hlkdwdvycqa0qza8
