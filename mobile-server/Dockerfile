FROM golang:latest as build-server

WORKDIR go/src/github.com/bitmark-inc/mobile-app/mobile-server

ADD server .

RUN go install github.com/bitmark-inc/mobile-app/mobile-server

# --

FROM bitmark/go-env

COPY --from=build-server /go/bin/account /usr/bin/account

ADD account-client/dist /usr/share/account-client

COPY account/bitmark-account.conf.sample /.config/bitmark-account/bitmark-account.conf
COPY account/share/localization /usr/share/account/localization
COPY account/share/email /usr/share/account/email

RUN mkdir -p /tmp/account/assets

ENV BITMARK_CONFIGURATION /.config/bitmark-account/bitmark-account.conf

EXPOSE 8900

ENTRYPOINT [ "/usr/bin/account" ]
