FROM alpine

# System update
RUN apk --update upgrade && apk update && apk add curl ca-certificates && update-ca-certificates --fresh && apk add openssl

# Components
RUN apk --update add \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/main \
    --repository http://dl-cdn.alpinelinux.org/alpine/edge/community \
        nginx \
        gzip \
        php7 \
        php7-dom \
        php7-ctype \
        php7-curl \
        php7-fpm \
        php7-gd \
        php7-intl \
        php7-json \
        php7-mbstring \
        php7-mcrypt \
        php7-mysqli \
        php7-mysqlnd \
        php7-opcache \
        php7-pdo \
        php7-pdo_mysql \
        php7-posix \
        php7-session \
        php7-xml \
        php7-iconv \
        php7-phar \
        php7-openssl \
        php7-zlib \
        php7-zip \
    && rm -rf /var/cache/apk/*

# User
RUN addgroup -S www && adduser -S www -G www

# NGINX Setup
COPY nginx/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /run/nginx

#
WORKDIR /www

# Revive Adserver
RUN wget -qO- https://download.revive-adserver.com/revive-adserver-5.0.5.tar.gz | tar xz --strip 1 \
    && chown -R www:www . \
    && rm -rf /var/cache/apk/*

# Permissions
RUN chmod -R a+w /www/var \
    && chmod -R a+w /www/plugins \
    && chmod -R a+w /www/www/admin/plugins \
    && chmod -R a+w /www/www/images

# Ports
EXPOSE 80

# Volumes
VOLUME /www

CMD php-fpm7 && nginx -g 'daemon off;'
