#!/bin/sh

git pull
COMMIT=$(git rev-parse --short HEAD)
echo $COMMIT
docker build -t 083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/data-donation:0.1-$COMMIT . || { echo 'build failed' ; exit 1; }
aws ecr get-login --no-include-email | sh
docker push 083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/data-donation:0.1-$COMMIT

kubectl set image deployment/data-donation data-donation=083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/data-donation:0.1-$COMMIT
