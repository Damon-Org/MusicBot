# Damon Music ChangeLog

## 2017-05-29, Version v2.0.0-beta.1, @calebboyd

Nexe 2.0 is a rewrite to enable some new features. These include:
  * Quick Builds!
  * Userland build patches
  * Resource storage/access rewrite
  * stdin interface
  * Optional, pluggable bundling

### Breaking Changes
  * New options -- Please see the [readme](README.md#options)
  * Bundling is no longer enabled by default
  * To access included resources `fs.readFile` and `fs.readFileSync` should be used

## 2015-02-20, Version v0.3.7, @jaredallard

### Noteable Changes

  * Fixed #103.
  * Made not-available require not a fatal error.
  * Stub and system to ignore certain requires.
  * Added 'sys' to ignore list.
  * We have a gitter!
  * Gave win32 a 100 length progress bar.

### Commits

  * [**2cacd83**] Update README.md (@crcn)
  * [**0e90ac9**] Update README.md (@crcn)
  * [**54967d1**] Added Gitter badge (@jaredallard)
  * [**bb489a3**] Fixes #98 by giving win32 a 100 length progress bar. (@jaredallard)
  * [**39665a8**] Lighter weight way to accomplish the exclusion of the sys module (@CKarper)
  * [**5aca22d**] This handles embedding 'bin' scripts with shebang interpreter... (@CKarper)
  * [**e79b0fb**] Stub to ignore require('sys') (@CKarper)

## 2015-02-15, Version v0.3.6, @jaredallard

### Noteable Changes

  * Now support .json in require.
  * Fixed a major --python flag bug.

### Commits

  * [**cac6986**] V bump to solve critical error. (@jaredallard)
  * [**b040337**] Fixes #99, resolves #97 by warning on missing file. New examples... (@jaredallard)
  * [**ad4da1d**] Support .json extensions in require() resolution (@CKarper)
