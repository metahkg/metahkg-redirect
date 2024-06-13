#### 6.15.0 (2024-06-13)

##### Chores

*  set version 6.15.0 (71b9201d)
*  set version 6.14.0 (5ad2ba4a)
*  prettify (585b7813)
*  update license terms (6cbb1224)
*  set version v6.9.0 (5eced6d0)
*  set version v6.7.0 (f091ccd2)
*  update CHANGELOG.md (87a868c9)

##### Continuous Integration

*  update .deepsource.toml (15ac093b)
*  fix tagging (b495e2c3)

##### New Features

*  support hmac verification (f334b34d)
*  switch to use mongodb (eb5b8e9b)

##### Bug Fixes

* **getInfo:**
  *  columns of malware urls (a87ae127)
  *  urlhaus csv format (c92ffce4)
*  remove lint (667587a2)
*  add 0.0.0.0 as host (090107d7)
*  is forbidden host (9a14175a)
*  remove private-ip (069ab10e)
* **threat:**  type (5d9079bb)
* **hmac:**  use hmac.digest once only (the HMAC object is destroyed after one call) (e62ec4ba)
* **code:**
  *  JS-R1004 Useless template literal found (b5d2d257)
  *  JS-0343 Detected throwing literals as exceptions (5bdedb7e)
  *  JS-0379 Prefer consistent returning of awaited values (20590911)
  *  JS-E1008 Found cyclic imports (6f5837a5)

##### Other Changes

* //gitlab.com/metahkg/metahkg-redirect into dev (c7a633f4)
*  CHANGELOG.md (a02c7671)
* //gitlab.com/metahkg/metahkg-redirect into dev (1ed6940f)
*  bump dependencies (9f12661d)
* //gitlab.com/metahkg/metahkg-redirect into dev (ace029d2)
* //gitlab.com/metahkg/metahkg-redirect into dev (cb1c7d91)
*  parse columns from csv (364513dd)
*  remove sharp (8f250de6)
* //gitlab.com/metahkg/metahkg-redirect into dev (0a98a18e)
* //github.com/metahkg/metahkg-redirect into dev (fe1fb154)
* //gitlab.com/metahkg/metahkg-redirect into dev (49f60fbf)
*  CHANGELOG.md (c3d1b448)
* //gitlab.com/metahkg/metahkg-redirect into dev (1d168c83)

#### 6.14.0 (2024-06-02)

##### Chores

*  set version 6.14.0 (5ad2ba4a)
*  prettify (585b7813)
*  update license terms (6cbb1224)
*  set version v6.9.0 (5eced6d0)
*  set version v6.7.0 (f091ccd2)
*  update CHANGELOG.md (87a868c9)

##### Continuous Integration

*  update .deepsource.toml (15ac093b)
*  fix tagging (b495e2c3)

##### New Features

*  support hmac verification (f334b34d)
*  force landing (ce684600)
*  switch to use mongodb (eb5b8e9b)
*  forbid private / local ip addresses (70914a9d)

##### Bug Fixes

* **getInfo:**
  *  columns of malware urls (a87ae127)
  *  urlhaus csv format (c92ffce4)
*  remove lint (667587a2)
*  add 0.0.0.0 as host (090107d7)
*  is forbidden host (9a14175a)
*  remove private-ip (069ab10e)
*  add margin to cancel icon (ca0294fb)
* **threat:**  type (5d9079bb)
* **hmac:**  use hmac.digest once only (the HMAC object is destroyed after one call) (e62ec4ba)
* **code:**
  *  JS-R1004 Useless template literal found (b5d2d257)
  *  JS-0343 Detected throwing literals as exceptions (5bdedb7e)
  *  JS-0379 Prefer consistent returning of awaited values (20590911)
  *  JS-E1008 Found cyclic imports (6f5837a5)
* **countdown:**  tidy url (9be8d121)

##### Other Changes

* //gitlab.com/metahkg/metahkg-redirect into dev (1ed6940f)
*  bump dependencies (9f12661d)
* //gitlab.com/metahkg/metahkg-redirect into dev (ace029d2)
* //gitlab.com/metahkg/metahkg-redirect into dev (cb1c7d91)
*  parse columns from csv (364513dd)
*  remove sharp (8f250de6)
* //gitlab.com/metahkg/metahkg-redirect into dev (0a98a18e)
* //github.com/metahkg/metahkg-redirect into dev (fe1fb154)
* //gitlab.com/metahkg/metahkg-redirect into dev (49f60fbf)
*  CHANGELOG.md (c3d1b448)
* //gitlab.com/metahkg/metahkg-redirect into dev (1d168c83)

#### 6.9.0 (2023-04-26)

##### Chores

- set version v6.9.0 (5eced6d0)
- set version v6.7.0 (f091ccd2)
- update CHANGELOG.md (87a868c9)
- add turbo config (fa55dbbc)
- v6.4.1 (359f7aa7)
- add docstrings (d19f0e80)
- add docstrings (a8c74b49)
- use property shorthand (b10a4d2a)
- use template string (8a583691)

##### Continuous Integration

- fix tagging (b495e2c3)

##### New Features

- support hmac verification (f334b34d)
- force landing (ce684600)

##### Bug Fixes

- **countdown:** tidy url (9be8d121)
- **url:** already decoded by default, no need to decode again (f900fd36)
- use useCallback (252d1ce4)
- remove @ts-ignore (11aa285b)
- remove arrow functions in jsx (8bd44be6)
- **regex:** remove unnecessary escapes (00311b4c)
- **getInfo:** function not executed (651db056)

##### Other Changes

- //gitlab.com/metahkg/metahkg-redirect into dev (1d168c83)

#### 6.4.1 (2023-04-24)

##### Chores

- add turbo config (fa55dbbc)
- v6.4.1 (359f7aa7)
- add docstrings (d19f0e80)
- add docstrings (a8c74b49)
- use property shorthand (b10a4d2a)
- use template string (8a583691)
- upgrade dependencies (29b6b816)
- update eslint config (2cf8d600)
- opt out of experimental appDir (c725f7d9)

##### Continuous Integration

- fix tagging (b495e2c3)
- fix tagging (a1ab44ac)

##### New Features

- force landing (ce684600)

##### Bug Fixes

- **countdown:** tidy url (9be8d121)
- **url:** already decoded by default, no need to decode again (f900fd36)
- use useCallback (252d1ce4)
- remove @ts-ignore (11aa285b)
- remove arrow functions in jsx (8bd44be6)
- add title and description (102051cb)
- remove unused variables (a9c68d92)
- add title and description (47acf789)
- is forbidden host (a940677c)
- remove private-ip (9581c7cb)
- **regex:** remove unnecessary escapes (00311b4c)
- **getInfo:** function not executed (651db056)

##### Other Changes

- yarn.lock (0a09a5c3)

#### 6.4.0 (2023-02-16)

##### New Features

- switch to use mongodb (eb5b8e9b)
- forbid private / local ip addresses (70914a9d)
- remove 'Redirect' in title when screen is small (5832c65a)
- light mode (cd04e49c)

##### Bug Fixes

- is forbidden host (9a14175a)
- remove private-ip (069ab10e)
- add margin to cancel icon (ca0294fb)

##### Other Changes

- add timeout and max options (0b2d9432)
- package.json (882f1697)
- //gitlab.com/metahkg/metahkg-redirect into dev (ced6f2e5)
- cache 15 mins (35b080df)
- store lists in memory (ee806f3e)
