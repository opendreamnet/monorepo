FROM chialab/php:7.4-fpm

# System update
#RUN apk --update upgrade && apk update && apk add curl ca-certificates && update-ca-certificates --fresh && apk add openssl

RUN apt-get update && apt-get install -y wget

#
WORKDIR /www

# Revive Adserver
RUN wget -qO- https://download.revive-adserver.com/revive-adserver-5.0.5.tar.gz | tar xz --strip 1

# Permissions
RUN chmod -R a+w /www/var /www/plugins /www/www/admin/plugins /www/www/images

# Ports
EXPOSE 9000

# Volumes
VOLUME /www
