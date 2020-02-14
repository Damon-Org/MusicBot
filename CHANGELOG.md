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

## 2020-02-14, Version v0.4.3 @Yimura

### Notable Changes

 * Modified all module exported files to support documentation generation better
 * Added JSDoc configuration file
 * Enhanced inline code documentation

### Commits

 * [**this_commit**]

## 2020-02-13, Version v0.4.2 @Yimura

### Notable Changes

 * Added skipTo command
 * Fixed bug where remove command would show the old command prefix
 * Fixed bug where remove command would say it had successfully removed a song while in fact it has silently failed
 * Added better visible yesNoOptions
 * Fixed queue command not working with negative pages
 * Playlist handling now accounts for urls that do not contain a YT Video ID
 * Fixed fatal error which would crash the entire bot

### Commits

 * [**57c685fc6d96bbe110df6b9b0ada450d511ff2a3**] Added skipTo command, fixed two bugs in remove command
 * [**bb12ad846d1e54f0a479bc312813d49156ad95a4**] Added better visible yesNoOptions, fixed queue command not working with negative pages
 * [**242a68885bb088bb529b46fb52b85fe852a6ce87**] Playlist handling now accounts for urls that do not contain a YT Video ID
 * [**this_commit**] Fixed fatal error that would crash the entire bot

## 2020-02-12, Version v0.4.1 @Yimura

### Notable Changes

 * Playlist support was added for all the supported Lavalink sources
 * Code for adding to the queue and creating a new queue was cleaned up and moved into a general function
 * Bugs were squashed related to adding a song to the queue that contained a list id
 * Added presence rotation
 * Added version in source code

### Commits

 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Playlist support and cleanup of code
 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Presence rotation was added
 * [**38516db2d297c13c8790a0395d049c7850f2fabf**] Added version in source code

## 2019-12-30 to 2020-02-11, Version v0.4.0 @Yimura

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

### Changelogs prior to this point were not recorded.
