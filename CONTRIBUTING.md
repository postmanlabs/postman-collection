# Contributing to Postman Collection SDK

## Command Reference

### `npm install -d`

### `npm test`

### `npm test-lint`

### `npm test-infra`

## Repository

### Structure

Directory       | Summary
----------------|---------------------------------------------
`scripts`       | All CI scripts (triggered by NPM run-script)
`lib`           | Library source modules, tests and doc source
`tests`         | All repository and lib test specifications
`bin`           | Command line scripts
`examples`      | Sample artefacts, fixtures and scripts

~~ to be documented further ~~

### Branching and Tagging Policy

This repository uses standard `git-flow` branch management policy/strategy. If you want to learn more on `git-flow`, 
refer  to [tutorial from Atlassian](https://www.atlassian.com/git/workflows#!workflow-gitflow) and more details at 
[http://nvie.com/posts/a-successful-git-branching-model/](http://nvie.com/posts/a-successful-git-branching-model/).

> Deletion of `master` and `develop`.
> Rebasing on `master` is blocked.

## Preferred IDE

Please use an IDE with [EditorConfig](http://editorconfig.org/) support.

Things like using 120 character ruler, addition of end-of-file newline, cleaning up of trailing whitespace have been
configured in this project using `.editorconfig`.

## Commit Guidelines

The following best practices, coupled with a pinch of common-sense will keep the repository clean and usable in future. 
The idea is that everything that goes into the repository is not for an individual, but someone else who will be 
directly or indirectly affected by it.

### Check for errors before committing

Checking for errors should be done for each commit whether it is being pushed to remote or not.

First, you don't want to submit any whitespace errors. Git provides an easy way to check for this — before you commit, 
run `git diff --check`, which identifies possible whitespace errors and lists them for you. If you run that command 
before committing, you can tell if you're about to commit whitespace issues that may annoy other developers.

Secondly, you should ensure that your commit does not break builds. Run `npm test` on the repository to execute all 
sanity and smoke tests. If any test fail, do not change the test to pass your commit. The tests were there with a 
purpose. Discuss within your team to ensure that the changes that you do to test specs are valid. If you are adding a 
new feature, accompanying them with new tests are a good practice.

### Atomic commits

Try to make each commit a logically separate changeset. If you can, try to make your changes digestible — don't code for 
a whole weekend on five different issues and then submit them all as one massive commit on Monday. Even if you don't 
commit during the weekend, use the staging area on Monday to split your work into at least one commit per issue, with a 
useful message per commit. If some of the changes modify the same file, try to use `git add --patch` to partially stage 
files. The project snapshot at the tip of the branch is identical whether you do one commit or five, as long as all the 
changes are added at some point, so try to make things easier on your fellow developers when they have to review your 
changes. This approach also makes it easier to pull out or revert one of the changesets if you need to later. There are 
a number of useful Git tricks for rewriting history and interactively staging files — use these tools to help craft a 
clean and understandable history.

### Clean commit message

*More detailed explanation includes your motivation for the change and contrast its implementation with previous
behavior — this is a good guideline to follow.*

Getting in the habit of creating quality commit messages makes using and collaborating with Git a lot easier. As a 
general rule, your messages should start with a single line that’s no more than about 50 characters and that describes 
the changeset concisely, followed by a blank line, followed by a more detailed explanation.

It's also a good idea to use the imperative present tense in these messages. In other words, use commands. Instead of 
"I added tests for" or "Adding tests for," use "Add tests for."

You should see if your commit message answers the following questions:
Answer the following questions:

1. **Why is this change necessary?**
2. **How does it address the issue?**
3. **What side effects does this change have?**

The first question tells reviewers of your pull request what to expect in the commit, allowing them to more easily 
identify and point out unrelated changes.

The second question describes, at a high level, what was done to affect change. If your change is obvious, you may be 
able to omit addressing this question.

The third is the most important question to answer, as it can point out problems where you are making too many changes 
in one commit or branch. One or two bullet points for related changes may be okay, but five or six are likely indicators 
of a commit that is doing too many things.

A good commit message template

```
Short (50 chars or less) summary of changes with relevant project management issue ID.

More detailed explanatory text, if necessary.  Wrap it to about 72 characters or so.  In some contexts, the first line 
is treated as the subject of an email and the rest of the text as the body.  The blank line separating the summary from 
the body is critical (unless you omit the body entirely); tools like rebase can get confused if you run the two 
together.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded by a single space, with blank lines in between, but 
 conventions vary here
```

Run `git log --no-merges` to see what a nicely formatted project-commit history looks like.

## Guidelines for sending a Pull Request

Commit to master branch and develop branch is locked. As such, `git-flow` for feature completion and release will not 
work. Thus, the last steps of feature completion in `git-flow` will happen as a Pull Request from website. 

1. Pull Request comment and commit comments should explicitly discuss what changes were made. The Pull Request reviewer 
   should not need to communicate out of scope of issue tracker and the pull request description in order to understand 
   what changes has been done.

2. Pull Request should not be accepted with a test failure. Ensure that `npm test` passes on the `head` of your feature 
   branch.

3. Ensure that your feature branch has been tested and if it is associated with issues from corresponding issue-tracker,
   the issue must be in a "resolved" state, implying that the issue has been fully tested, and accepted for inclusion.

4. Pull Requests with merge conflict are very difficult to review. Ensure that the `head` of your feature branch is 
   either already merged with `develop` or has no conflict when it is merged with `develop`.

5. The turn around time to close Pull Request is directly proportional to the delta of changes done - more the change in
   files, more time it would take. As such, if you anticipate a feature branch to have a large delta on feature 
   completion, break it into sub-issues of the issue-tracker, test them, close them, and then send PR for that branch.

6. Turn around time for Pull Request would get affected if commit messages are unclear.

7. If you have deadlines to ensure feature completion, send Pull Request ahead of time. Better still, ensure your 
   feature development timeline accounts for PR acceptance.

8. If you have mentioned issue tracker references in Pull Request description, the severity and priority of those issues 
   will be taken into account. Otherwise, no Pull Request will take priority over others already in queue - it is 
   first-pull first-merge!

## Documentation guidelines

~~ to be documented further ~~

## The CI Platform

The CI system is built as a bunch of bash scripts to execute a set of tasks. These scripts are meant to execute tasks 
that can run on every local machine. In general, knowledge about these scripts are not necessary for development.

**The scripts are to be only accessed using `npm run <script name>`.** This ensures that the execution point of the 
scripts (`pwd`) is always the repository root.

### Ensuring your commits will not fail build

> `npm test`

The script associated with `npm test` will run all tests that ensures that your commit does not break anything in the 
repository. As such run `npm test` before you push.

~~ to be documented further ~~

### Accessing build log on CI server

~~ to be documented further ~~

### Accessing your build artifacts

All scripts output build artifacts to `./out`


---
*Sections of this document use excerpts from various books and the Internet.
[http://git-scm.com/book/](http://git-scm.com/book/) is one of the dominating influences.*
