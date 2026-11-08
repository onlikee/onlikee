# Degraded experiences

Ensuring that a page still renders and primary experiences are still available during downtime of optional service dependencies.

The primary audience for this guidance is GitHub staff.

Using the "blast" analogy for availability incidents, graceful degradation is about reducing the effect of a blast, not about preventing the blast or reducing the blast radius. The "blast" still happens and affects all experiences it did before, but with a reduced effect.

Don't try to conceal or downplay that something is wrong. Communicate that there is a problem and guide users around that problem as much as possible.

## Whether to render an error page instead

If there's an outage that doesn't affect the primary experiences of the page, it's best to render a degraded page to reduce disruptions. Don't attempt to render a page that won't be useful to the user.

GitHub's internal article about graceful degradation describes the difference between primary and secondary experiences:

> **Primary experiences** are those experiences that are essential for the page to be useful to the user. In case of availability incidents, if any of these experiences can't be provided to users, then it makes sense to show an error page instead. For example, on the issue page, the issue title and description are primary experiences.

> **Secondary experiences** are those experiences that are not essential for the page to be useful to the user. Instead, they enrich the page to make it more useful to some users for certain workflows. In case of availability incidents, if any of these experiences can't be provided to users, then it makes sense to show the page without them as the page is still likely useful to most users. For example, on the issue page, the unread notifications indicator is a secondary experience, as are the counters for the number of projects, issues, PR's, etc. in the repository navigation bar.

— [The Hub - Graceful Degradation in the Monolith](https://thehub.github.com/epd/engineering/dev-practicals/graceful-degradation/) (only available to GitHub staff)

## Global system notification

If there is a critical system error that will degrade the user experience, show a [Banner](https://primer.style/product/components/banner/) at the top of the page above the global navigation. Having a global Banner helps set the expectation that some parts of the usual UI might be missing or broken. Default to using the `"warning"` variant of the Banner.

Explain what's wrong and, if possible, link to a page with more detailed information. For example, if there's a database outage, we could link to the [GitHub status page](https://www.githubstatus.com/).

In addition to a global Banner, we should inform users about availability issues in context. The following guidelines discuss how to handle outages in the context of the affected UI.

![Image of a page with a Banner at the top explaining an error. The Banner says 'Some content and actions may be unavailable. Try refreshing. If the problem persists, check the GitHub status page, or contact support.'](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1735-721.png&w=1080&q=75)

Image of a page with a Banner at the top explaining an error. The Banner says 'Some content and actions may be unavailable. Try refreshing. If the problem persists, check the GitHub status page, or contact support.'

## Degraded page content

Before making a decision about how to handle UI with unavailable content, check if it already has guidelines on handling errors or empty states.

### Replacing UI with a message

![A screenshot of the Primer organization page. The repositories list is replaced with a message informing the user that the repositories are temporarily unavailable.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1799-19738.png&w=1920&q=75)

A screenshot of the Primer organization page. The repositories list is replaced with a message informing the user that the repositories are temporarily unavailable.

We don't want users to think they've suffered data loss. If we know a user created something, don't show a generic "empty state". It's better to explain that it's unavailable, or remove the entire section from the page (including the section's heading). For example, I might think my repositories were deleted if I'm on an organization page (like [https://github.com/primer/](https://github.com/primer/)) and the repositories aren't listed there.

Ideally we can strike a balance and give the user just the right amount of context without overwhelming them with error messages. A page with too many error messages could communicate an unnecessarily reactionary and negative tone. As a general guideline, we suggest limiting pages to 5 or less outage messages.

#### Inline content and smaller elements

Smaller parts of the UI that cannot be accurately rendered but are too important to exclude entirely can often be replaced with a short error message.

![Two images: 1. Image of Memex table with populated content cells; 2. Image of Memex table with missing content message in cells.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1735-142191.png&w=1920&q=75)

Two images: 1. Image of Memex table with populated content cells; 2. Image of Memex table with missing content message in cells.

By default, replace the affected content with an error message. Show a warning icon before the message to help differentiate it from non-degraded content. The message may be colored with `fg.warning` to draw more attention to it.

Be mindful that rendering too many error messages on the page in `fg.warning` could be jarring and make the page feel broken instead of degraded.

**Do**

![Image of Memex table with missing content message in cells.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1738-855.png&w=1080&q=75)

Render an error message in place of the content.

**Don’t**

![Image of Memex table with 'undefined of undefined'.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1738-873.png&w=1080&q=75)

Don't attempt to render UI that is missing critical information.

#### Panels and larger areas

![Two images: 1. comment box; 2. Blankslate in place of comment box.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1735-125689.png&w=1920&q=75)

Two images: 1. comment box; 2. Blankslate in place of comment box.

If the affected area is large enough, replace the affected UI with a [blankstate](https://primer.style/product/components/blankslate/) component that explains why the expected UI isn't there.

##### Blankslate guidance for degraded content

![A diagram of a Blankslate component used to notify users of unavailable data. The labeled parts are: 'Leading visual (required)', 'Primary text', 'Secondary text (required)', and 'Secondary action'.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-2104-18074.png&w=1920&q=75)

A diagram of a Blankslate component used to notify users of unavailable data. The labeled parts are: 'Leading visual (required)', 'Primary text', 'Secondary text (required)', and 'Secondary action'.

- **Leading visual**: Use the [alert icon](https://primer.style/octicons/icon/alert-24/). Default to using `fgColor-muted` as the fill color. Using `fgColor-attention` could be too harsh and over-emphasize the error. Reference: [Primer Primitives functional colors](https://primer.style/primitives/storybook/?path=/story/color-functional-all--all).
- **Primary text**: You may optionally use the primary text for a title that succinctly describes the error.
- **Secondary text**: Use the secondary text to describe what's wrong and how (or if) the user can do anything to get around the issue.
- **Secondary action**: Use the secondary action for any action or link to places with more information.

We have yet to identify a case where a primary action would be appropriate. Theoretically, a primary action may be appropriate if it initiates an action that will resolve the problem.

For help with writing error copy for the Blankslate component, see the following parts of the empty state guidelines:

- [Error state content and copy](https://primer.style/product/ui-patterns/empty-states/#error-states)
- [Empty state primary text](https://primer.style/product/ui-patterns/empty-states/#primary-text)
- [Empty state secondary text](https://primer.style/product/ui-patterns/empty-states/#for-errors)

For more information about the Blankslate component, reference the [Blankslate interface guidelines](https://primer.style/product/components/blankslate/).

#### Dialogs (modal and non-modal)

If the content of a Dialog is not critical and cannot be rendered, prevent the Dialog from even being opened. For non-critical Dialogs that appear on hover, remove the hover interaction. For non-critical Dialogs that appear on click, remove the button that triggers the Dialog. For example, if a user's profile data cannot is unavailable, don't show a hovercard when their avatar is hovered.

If the Dialog is a core part of a workflow, replace the content of the Dialog with a message explaining why the expected UI isn't there. If you're using a Dialog component that supports error states (for example, [SelectPanel](https://primer.style/product/components/select-menu/#select-panel)), follow the component's guidelines for rendering error messages.

![Two images: 1. Label or assignee SelectPanel 2. A degraded versin of that.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-18104.png&w=1920&q=75)

Two images: 1. Label or assignee SelectPanel 2. A degraded versin of that.

If you're not using a component that supports error states, replace the content of the Dialog with a [blankstate](https://primer.style/product/components/blankslate/) component explaining why the expected UI isn't there.

![Two images: 1. 'Edit details' modal that appears when you edit a column in a Memex project board 2. A degraded versin of that.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-158859.png&w=1920&q=75)

Two images: 1. 'Edit details' modal that appears when you edit a column in a Memex project board 2. A degraded versin of that.

![Two images: 1. Label or assignee SelectPanel 2. A degraded versin of that.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-18104.png&w=1920&q=75)

Two images: 1. Label or assignee SelectPanel 2. A degraded versin of that.

If you're not using a component that supports error states, replace the content of the Dialog with a [Blankslate](https://primer.style/product/components/blankslate/) component explaining why the expected UI isn't there.

![Two images: 1. 'Edit details' modal that appears when you edit a column in a Memex project board 2. A degraded versin of that.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-158859.png&w=1920&q=75)

Two images: 1. 'Edit details' modal that appears when you edit a column in a Memex project board 2. A degraded versin of that.

### Removing UI

Be mindful when choosing to remove affected UI without explanation, as this could cause confusion for users about whether that part of the UI is hidden due to an error, or if it's been permanently removed.

However, it is acceptable to remove UI that's not critical to core workflows and render the rest of the page without that UI. For example: choosing to hide unavailable activity indicators.

Examples of UI that we do not recommend removing:

- The comment box on issues and pull requests
- The "Request changes" button in the pull request "Changes" tab
- Submit buttons on forms

#### Handling unavailable counts

When the data required to calculate a count is unavailable, default to hiding the number. If the count is shown inside of an interactive element, a tooltip may be displayed on focus and hover to explain the missing count.

![Two images of repo tabs: 1. Tabs have counts; 2. Tabs don't have counts;.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1774-11929.png&w=1080&q=75)

Two images of repo tabs: 1. Tabs have counts; 2. Tabs don't have counts;.

#### Handling activity indicators

When the data is unavailable to determine whether to show an activity indicator (most commonly used for notification badges), default to hiding the indicator.

![Image of the notification link button in the global nav without a badge.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1817-175148.png&w=1080&q=75)

Image of the notification link button in the global nav without a badge.

## Degraded navigation

Some links can be static (for example, `https://github.com/`), but many links are made from dynamic data (for example: `https://github.com/{org}/{repo}/issues/{issue-number}`).

When a dynamic link in the navigation is not yet available, fall back to not rendering it.

If the page is in a state where we're not sure if a link is available, the navigation item should be put in a loading state. Refer to the pattern guidelines for [loading](https://primer.style/product/ui-patterns/loading/) for more information.

### Global navigation header

![4 global navigations - 1 in default state, 3 in various degraded states.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-160966.png&w=1920&q=75)

4 global navigations - 1 in default state, 3 in various degraded states.

Never suppress rendering of the global navigation header. Rendering a page without global navigation header could make a user feel stuck. Instead, suppress rendering of individual navigation items affected by a system error.

Most of the links in the global navigation header are static and will not need to be degraded anyway.

### Global navigation side sheets

The left and right global navigation [side sheets](https://primer.style/product/components/dialog/#side-sheets) lazy-load some of their content when the nav is first opened. For example, repos and teams in the left global navigation side sheet.

If the user can see a loading state before a failure, inform them that there was a failure. If the user does not see a loading state before a failure, you may skip rendering the affected links. See the interface guidelines about [loading patterns](https://primer.style/product/ui-patterns/loading/#navigation) for more information about how to handle navigation loading states.

If we know specifically what groups couldn't be loaded, provide those details in the error message. Otherwise, show a generic error message.

![2 images: 1. Error Banner with details about what couldn't load; 2. Generic error Banner.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1905-38790.png&w=1080&q=75)

2 images: 1. Error Banner with details about what couldn't load; 2. Generic error Banner.

#### Degraded side sheet group actions

![2 images: 1. Default left side sheet; 2. Search icons and show more buttons/links are not rendered.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1887-25337.png&w=1920&q=75)

2 images: 1. Default left side sheet; 2. Search icons and show more buttons/links are not rendered.

If the data to render the "Show more" link or button at the bottom of a NavList group is unavailable, just don't render it.

If the data to render the search button in a NavList group is unavailable, just don't render it.

### Page navigation

Common types of page navigation include [UnderlineNav](https://primer.style/product/components/underline-nav/) (for example, a repo page) and [NavList](https://primer.style/product/components/nav-list/) as sidebar navigation (for example, settings pages).

#### UnderlineNav

![A NavList with the first item in an inactive state. A cursor is hovering the alert icon in the leading visual slot.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1776-160968.png&w=1920&q=75)

A NavList with the first item in an inactive state. A cursor is hovering the alert icon in the leading visual slot.

There may be cases where a page has to degrade its own navigation. If the data required to render a page navigation link is unavailable, don't render the navigation link.

If data required to render notification badges or counts is not available, don't render the badge. This was also mentioned above in the [Handling unavailable counts](#handling-unavailable-counts) section.

#### NavList

If a NavList is not inside a side-sheet that lazy-loads its link data, you can render inactive items immediately. This follows the same inactive item pattern as [ActionList](https://primer.style/product/components/action-list/#inactive-items).

![An ActionList with the first item in an inactive state. A cursor is hovering the alert icon in the leading visual slot.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-2128-24031.png&w=1080&q=75)

An ActionList with the first item in an inactive state. A cursor is hovering the alert icon in the leading visual slot.

## Degraded interactions

### Handling non-functional buttons

![Decision tree for how to handle a non-functional button. Could removing the button be disorienting? If no, don't render the button. If yes: does it respond to a hover or click? If yes, use an inactive button. If no, use a disabled button.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1768-11685.png&w=1920&q=75)

Decision tree for how to handle a non-functional button. Could removing the button be disorienting? If no, don't render the button. If yes: does it respond to a hover or click? If yes, use an inactive button. If no, use a disabled button.

#### Removing a non-functional button

Default to removing non-functional buttons from the UI. Don't remove buttons that are critical to a user's workflow—it may be disorienting.

**Do**

![A sample comment by the user monacat where the comment reaction button has been removed.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-1745-126650.png&w=1080&q=75)

Comment reaction button hidden.

**Don’t**

![Request changes button hidden.](https://primer.style/_next/image/?url=%2Fimages%2Ffigma%2FYlBTqHTbdRwYQt0bfIHvGw-2022-30083.png&w=1080&q=75)

Don't hide buttons that part of core workflows.

#### Indicating a button is non-functional without disabling it

If a button is too critical to be omitted and responds to user input by showing more info about why it's non-functional, use an inactive Button.

Inactive button labels text still need to meet an accessible color contrast ratio.

For more information, see the the [inactive Button guidelines](https://primer.style/product/components/button/#inactive)

### Handling ActionLists and menus with non-functional items

The ActionList and ActionMenu components provide an inactive state for their items. See their documentation pages for more information:

- [Inactive ActionList items](https://primer.style/product/components/action-list/#inactive-items)
- [Inactive ActionMenu items](https://primer.style/product/components/action-menu/#inactive-items)

### Handling degraded forms

Refer to the [degraded form experience](https://primer.style/product/ui-patterns/forms/#handling-degraded-forms) section of the form pattern guidelines.

## Waiting for a timeout

There could be cases where we're waiting for data to load before determining that it's unavailable. In this case, refer to Primer's general [loading state guidance](https://primer.style/product/ui-patterns/loading/). If the component has its own loading state guidelines, refer to those.

## CLI

It's confusing and frustrating when a command silently fails. If a command fails, immediately return an error message or wait for a timeout to expire and then return an error message.

## Accessibility

Never disable an interactive control that is non-functional due to availability issues.

A common (but inaccessible) pattern is to show a tooltip with more information when a user hovers an error message or a disabled button. However, tooltips may only be used on focusable elements.

## Related links

- [Blankslate](https://primer.style/product/components/blankslate/)
- [Dialog](https://primer.style/product/components/dialog/)
- [Tooltip](https://primer.style/product/components/tooltip/)
- [Loading](https://primer.style/product/ui-patterns/loading/)
- [Messaging](https://primer.style/product/ui-patterns/messaging/)
- [Empty states](https://primer.style/product/ui-patterns/empty-states/)

<!--
Source: https://primer.style/product/ui-patterns/degraded-experiences/
License: MIT (https://github.com/primer/design/blob/main/LICENSE)

Copyright (c) GitHub, Inc.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
-->
