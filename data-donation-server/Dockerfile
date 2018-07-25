FROM bitmark/nodejs-env

COPY share /init-db

COPY . /app
RUN cd /app && with_nvm npm install

ENV BITMARK_CONFIGURATION /app/configs/bitmark-data-donation.devnet.config.json

WORKDIR /app

EXPOSE 9001

CMD [ "node", "index.js"]