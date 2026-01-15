FROM alpine:3.20

ARG PB_VERSION=0.35.1

RUN apk add --no-cache ca-certificates wget unzip

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
