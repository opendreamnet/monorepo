@echo off

set containerName=dreamlink-cluster
set containerExec=ipfs-cluster-service

docker exec -ti %containerName% sh -c "%containerExec% %*"