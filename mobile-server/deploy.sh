git pull
COMMIT=$(git rev-parse --short HEAD)
echo $COMMIT
aws ecr get-login --no-include-email | sh

docker build -t 083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/bitmark-mobile:$COMMIT . || { echo 'build failed' ; exit 1; }
docker push 083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/bitmark-mobile:$COMMIT
kubectl set image deployment/bitmark-mobile bitmark-mobile=083397868157.dkr.ecr.ap-northeast-1.amazonaws.com/bitmark-mobile:$COMMIT