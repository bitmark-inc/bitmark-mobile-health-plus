# Bitmark SDK for Swift

[![Build Status](https://travis-ci.org/bitmark-inc/bitmark-sdk-swift.svg?branch=master)](https://travis-ci.org/bitmark-inc/bitmark-sdk-swift)
[![codecov](https://codecov.io/gh/bitmark-inc/bitmark-sdk-swift/branch/master/graph/badge.svg)](https://codecov.io/gh/bitmark-inc/bitmark-sdk-swift)
[![CocoaPods](https://img.shields.io/cocoapods/v/BitmarkSDK.svg)]()
[![CocoaPods](https://img.shields.io/cocoapods/l/BitmarkSDK.svg)]()
[![CocoaPods](https://img.shields.io/cocoapods/p/BitmarkSDK.svg)]()
[![Carthage compatible](https://img.shields.io/badge/Carthage-compatible-4BC51D.svg?style=flat)](https://github.com/Carthage/Carthage)

## Requirements

- iOS 11.0+
- Xcode 10.0+
- Swift 4.0+

## Installation
### CocoaPods
[CocoaPods](http://cocoapods.org) is a dependency manager for Cocoa projects. You can install it with the following command:

```bash
$ gem install cocoapods
```

> CocoaPods 1.1+ is required to build BitmarkSDK 2.0+.

To integrate BitmarkSDK into your Xcode project using CocoaPods, specify it in your `Podfile`:

```ruby
source 'https://github.com/CocoaPods/Specs.git'
platform :ios, '11.0'
use_frameworks!

target '<Your Target Name>' do
    pod 'BitmarkSDK'
end
```

Then, run the following command:

```bash
$ pod install
```

### Carthage

[Carthage](https://github.com/Carthage/Carthage) is a decentralized dependency manager that builds your dependencies and provides you with binary frameworks.

You can install Carthage with [Homebrew](https://brew.sh/) using the following command:

```bash
$ brew update
$ brew install carthage
```

To integrate BitmarkSDK into your Xcode project using Carthage, specify it in your `Cartfile`:

```ogdl
github "bitmark-inc/bitmark-sdk-swift" ~> 2.2.0
```

Run `carthage update` to build the framework and drag the built `BitmarkSDK.framework` into your Xcode project.

### Swift Package Manager
Comming soon....

## Set up

```swift
import BitmarkSDK
```

## Documentation

Reference: https://sdk-docs.bitmark.com/?swift


# License

[See LICENSE](https://github.com/bitmark-inc/bitmark-sdk-swift/blob/master/LICENSE) for details.
