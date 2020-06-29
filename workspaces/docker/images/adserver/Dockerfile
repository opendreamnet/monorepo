FROM php:fpm-alpine

# System update
RUN apk --update upgrade && apk update && apk add curl ca-certificates && update-ca-certificates --fresh && apk add openssl

#
WORKDIR /code

# Revive Adserver
RUN wget -qO- https://download.revive-adserver.com/revive-adserver-5.0.5.tar.gz | tar xz --strip 1

# Permissions
RUN chmod -R a+w /code/var \
    && chmod -R a+w /code/plugins \
    && chmod -R a+w /code/www/admin/plugins \
    && chmod -R a+w /code/www/images

# Ports
EXPOSE 9000

# Volumes
VOLUME /code
