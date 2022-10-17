# GC Auth

Auth application for [Graffiticode](https://graffiticode.org) applications.

## API

### Generate Token

Use etherum loging to generate token
signed by GC auth key

### Get public keys

Client -> Auth (GET token/exchange)
Client -> API
  API -> Auth (get key)
  API -> Task
  API -> Compiler
