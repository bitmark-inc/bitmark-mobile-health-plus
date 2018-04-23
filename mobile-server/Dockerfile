FROM golang:latest as build-server

WORKDIR /go/src/github.com/bitmark-inc/mobile-app/mobile-server

ADD . .

RUN go install github.com/bitmark-inc/mobile-app/mobile-server

# --

FROM bitmark/go-env

COPY --from=build-server /go/bin/mobile-server /usr/bin/mobile-server

COPY mobile-server.conf.sample /.config/server/mobile-server.conf.sample

EXPOSE 9005 9006

ENTRYPOINT [ "/usr/bin/mobile-server", "-conf=/.config/server/mobile-server.conf.sample"]
