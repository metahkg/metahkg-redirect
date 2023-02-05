# Metahkg Redirect

A Next.js app for redirecting urls, with built-in threat detection.

## Introduction

Metahkg Redirect uses server-side rendering to get data. No api is exposed.

It detects:

- malicous hosts
- malware urls
- if url is not reachable
- if url redirects
- if url contains tracking parameters

If none of above are detected, the app returns a 302 redirect.

## Styles

- [NextUI](https://nextui.org/)
- [tailwindcss](https://tailwindcss.com)

## Sources

Metahkg Redirect determines whether a url is a threat using data from two sources:

- [Google Safebrowsing](https://safebrowsing.google.com/)
- [urlhaus](https://urlhaus.abuse.ch/api/)
- [malware filter](https://gitlab.com/malware-filter/urlhaus-filter/-/tree/main/#hosts-based) (for hosts)

Data is saved at the `data` directory. For Google Safebrowsing the app would fetch api at runtime.

## Caching

Metahkg Redirect uses redis for caching. TTL is 30 minutes.

Frontend caching header is also set to 30 minutes, with 30 minutes stale-while-revalidate.

## Scripts

### Development

```bash
yarn dev
```

### Build

```bash
yarn build
```

### Start

```bash
yarn start
```
