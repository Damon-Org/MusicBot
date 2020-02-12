# Damon Music Changelog

## Versioning Policy

Following:
**major.minor.patch**

* **major** is almost never used unless a complete rewrite happened of Damon Music
* **minor** used whenever a single file was rewritten or significant change happened
* **patch** may only be bumped after a bug was resolved as whole

Following (beta):
**0.major.minor/patch**

Major versions starting with a **0** will have **minor** interpreted as major's and a bump of this number will be seen as a total rewrite

## 2019-12-30, Version v0.4.0, @Yimura

### Notable Changes

  * Discord.js was updated from v11 to v12 with all the notable changes to the files following
  * Music System was rewritten to use Lavalink instead of ytdl-core and soundcloud
  * Code for reacting to a message was cleaned up
  * Moved all authentication information to a configuration file
  * The entire project was also made to be no longer reliant of an absolute path
  * RecordingSystem was implemented (unusable until a service is setup which allows for these files to be downloadable)
  * Removed redundant code prior to the Lavalink implementation
  * Fixed problems where MusicSystem would say that it has started playing music while in fact it ran into an error

### Commits

  * [**ac30b694923fbe2f162e7499ebe5dafa256357b2**] Rewrite of Damon Music
  * [**14723026c7faf34d6ce976c212178802a448d14f**] Configuration file was added
  * [**8cf5ca2f0d814856d34df6233d25d1a19917e9df**] Fixed MusicSystem to be properly reset if the queue did not start
  * [**ac6af0b9085c8258125a70b593496b17f613808f**] Fixed repeat command not properly working whereas the repeat reaction did work
  * [**8cf5ca2f0d814856d34df6233d25d1a19917e9df**] Fixed bug where bot wouldn't leave the voice channel if he were the last
  * [**21c2bd539614adc71fefd918a0a7d7ea0d0a069d**] Fixed where the default of the lock command would reset the lock instead of take the channel id as default

## 2019-12-29, Version v0.3.0, @Yimura

### Changelog's prior to this point was not recorded.
