---
title: Using Node.js Process Warnings
---
[Process warnings][process-warn] in Node are a very useful tool. They provide a standard interface for exposing warning information to developers, allowing library maintainers to communicate deprecations and possible issues to consumers while providing controls for application developers to deal with them. However, the documentation for them is surprisingly loose, and there are few documented best practictes for their use in libraries as far as I've seen. This article will be an introduction to process warnings and a set of guidelines for both package maintainers and application developers to follow when using process warnings.

## Why use process warnings?

Process warnings exist to surface information to developers that indicate the possibility of undesired behavior occuring in the future. They could indicate runtime issues, like a misconfigured module that may not behave as expected, or a code quality issue, like uses of a deprecated or obsoleted API. Importantly, process warnings should be warnings that can be fixed by the developer—they shouldn't be used to signal any old "warning" condition in your code, only issues that require developer attention to fix.

## Anatomy of a warning

Process warnings are emitted via [`process.emitWarning()`][process-emitWarning]. This function has two forms, but both allow the same basic options:

  - `warning`, the warning message
  - `type`, a string describing the type of warning (which defaults to just `'Warning'`)
  - `code`, an optional unique identifier for the cause of the error

By default, process warnings are displayed in the console output of the application and look like this:

    $ node -e 'process.emitWarning("Warning message", "WarningType", "code")'
    (node:49466) [code] WarningType: Warning message

The first time a process warning is emitted, Node may inform you of one other property of process warnings: like thrown exceptions and `Error` objects, they are also capable of presenting tracebacks.

    (Use `node --trace-warnings ...` to show where the warning was created)

Warnings also have an optional `detail` option, which is simply a string printed on a separate line after the warning message, as well as a `ctor` option, which takes a function that can be used to manipulate how the stack trace is displayed.

## Customizing warning display

Node accepts several command-line flags that can change the display of process warnings emitted in an application, such as the `--trace-warnings` flag mentioned before. These flags are documented in various places in [the `warning` event documentation][process-warn] and [the `emitWarning` documentation][process-emitWarning], and are summarized here.

  - Use `--trace-warnings` to print a stack trace alongside warnings.
  - Use `--no-warnings` to skip printing warnings to stdout.
  - Use `--trace-deprecation` to print a stack trace alongside deprecation warnings.
  - Use `--no-deprecation` to skip printing deprecation warnings to stdout.
  - Use `--throw-deprecation` to treat deprecation warnings as thrown exceptions originating from the relevant `process.emitWarning` call.

The `--*-deprecation` flags apply only to deprecation warnings—warnings with their `type` set to exactly `DeprecationWarning`. This is one of several warning types used by Node itself; however, it is the only warning type with its own specific command-line flags.

Note that the `--no-warnings` and `--no-deprecation` flags prevent warnings from being logged to the console, but do not prevent warnings from being emitted to the `warning` event. This is useful if you want to log warnings in a custom format or to an external service rather than sending them to the console.

## Warning types and origins

There is a [section of documentation discussing warning names][warning-names] which gives a list of some commonly-used warning types that can be emitted by Node itself, including `DeprecationWarning`. This section states that additional undocumented warning types may be emitted by Node; there is no exhaustive list of "official" warning types used by Node. There is also no guideline that the documented warning types can be used only by Node. This exposes a limitation of the process warning system: there is no standard way to identify the originator of a warning, whether it was the Node runtime, a specific library or package, or an application's own code. Using `--trace-warnings` and referencing the traceback can usually help fill this gap, though it can fall short if the original structure of the application has been lost, for example through a bundling or code optimization process prior to runtime.

Some of the documented warning types have very little use outside Node itself; most libraries likely have no reason to ever emit a `TimeoutOverflowWarning` unless they re-define the `setTimeout` global. Other types, like `DeprecationWarning`, describe more general categories of behavior and are almost certainly applicable to libraries as well.

`DeprecationWarning` is a somewhat special warning type. In addition to the `--*-deprecation` flags discussed above that specifically modify the treatment of this warning type, the documentation about warning names also states that the `code` property of Node-emitted `DeprecationWarning`s is used to identify the unique deprecation that caused the warning to be emitted:

> `'DeprecationWarning'` - Indicates use of a deprecated Node.js API or feature. Such warnings must include a 'code' property identifying the [deprecation code][deprecations]. <sup>[[source]][warning-names]</sup>

## Recommendations for package maintainers

Keep warning messages relatively short; if a longer description or links to external resources/project documentation is required, use the `detail` option in addition to a shorter description in the main warning message.

If your library has a complicated structure that may be confusing to consumers, consider using the `ctor` option to limit the stack trace of the emitted warning to only display lines that will be relevant to the consumer.

If you deprecate any part of your package's public API, use the `DeprecationWarning` warning type to surface this information to developers and give them control over how that information is handled. If possible, establish consistent deprecation codes for individual API changes. Warning `code`s for deprecation warnings should ideally include the name of your package or some other recognizeable identifier so that a developer reading the logs can know to look at your documentation when resolving the error. If possible, include a migration path away from the deprecated API in the warning message.

For other types of warnings, avoid using warning types that are documented and used by Node. Prefer warning types in `PascalCase` that end with `Warning`. Be specific; descriptive warning types and messages are one of the few ways a developer can quickly identify what part of their code is causing the warning, especially when working with multiple libraries. The `code` option is not limited to `DeprecationWarning`s; it may be useful to provide a code on all warnings to explicitly tie them to your library and provide a specific point of reference.

Consider establishing documentation for your project that lets consumers find more information about individual warning codes. For example, if your library is hosted on Github, consider creating a Github issue or discussion for each warning that can be emitted and using its reference number as the code for that warning.

## Recommendations for package consumers

The command-line flags for managing warnings are your friends. Use them in development to help identify issues before your changes reach production. Consider making `--trace-warnings` and/or `--throw-deprecation` part of your normal testing runtime.

In production, consider using the `--no-warnings` flag in combination with a `warning` event listener to report warnings to any external logging or analytics suite you may use.

When listening to the `warning` event to filter out certain warnings or to act automatically on emitted warnings, compare `code`s when possible rather than just filtering warnings by `type`. This can help avoid accidentally swallowing errors with the same `type` emitted by other libraries.

## Conclusions

Process warnings are not without their limitations and challenges. The inconsistent definition of warning types and codes, combined with the lack of any reliable mechanism for identifying the originator of a warning short of parsing tracebacks, makes them of limited usefulness for certain types of warnings, particularly those that carry lots of additional metadata or which should primarily be handled by code rather than by people. However, they have their place as a mechanism to assist with troubleshootinng and to surface unwanted behavior and API changes to consumers. To that end, I hope this piece is useful for determining when and how to implement and interface with process warnings.

[deprecations]: https://nodejs.org/docs/latest-v16.x/api/deprecations.html
[process-warn]: https://nodejs.org/docs/latest-v16.x/api/process.html#process_event_warning
[process-emitWarning]: https://nodejs.org/docs/latest-v16.x/api/process.html#process_process_emitwarning_warning_type_code_ctor
[warning-names]: https://nodejs.org/docs/latest-v16.x/api/process.html#nodejs-warning-names
