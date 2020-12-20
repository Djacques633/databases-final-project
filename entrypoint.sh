#! /bin/sh
/etc/init.d/mysql start
mysql < ./init.sql
sh