## node-qiwi-p2p

A module for node.js to interact with Qiwi Wallet's P2P System Api.

> Still in alpha v0.1.0

##### node-qiwi-p2p design features:

- Object-oriented
- 99.9% coverage of the Qiwi Wallet P2P API

###### Example:

```js
const { Client } = require('qiwi-p2p');

const qiwi = new Client({
  keys: { public: 'your api public key', secret: 'your api secret key' }
});

qiwi.bills
  .create('BILL_NO3', {
    amount: { currency: 'USD', value: 100 },
    comment: 'Custom Comment',
    customer: { account: 'Customer Account' },
    remaining: 4.32e7, // Remaining time in milliseconds
    customFields: { themeCode: 'My Theme Code' }
  })
  .then(bill => bill.poll())
  .then(bill => {
    console.log('Bill finished. New status:', bill.status.value);
  });
```

Links

[GitHub](https://github.com/zargovv/node-qiwi-p2p)
[NPM](https://npmjs.com/package/qiwi-p2p)

## Contributing Steps

1. Fork & clone the repository, and make sure you're on the master branch
2. Write some code
3. Submit a pull request (Make sure you follow the conventional commit format)

### Commit convention

> This is adapted and inspired by [discord.js's](https://github.com/discordjs/discord.js-next/blob/master/.github/COMMIT_CONVENTION.md) commit convention.

##### Messages must be matched by the following regex:

```js
/^(revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|build|ci|chore|types|wip)(\(.+\))?: .{1,72}/;
```

##### Examples

Appears under "Features" header, `Bill` subheader:

```md
feat(Bill): add 'poll' method
```

Appears under "Bug Fixes" header, BillManager subheader, with a link to issue #2:

```md
fix(BillManager): create bills validate options correctly

close #2
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```md
perf(Route): improve route handling by removing hash handling

BREAKING CHANGE: Route hashes were removed
```

The following commit and commit 667ecc1 do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```md
revert: feat(Managers): add Managers

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

##### Full Message Format

A commit message consists of a header, body and footer. The header has a type, scope and subject:

```md
<type>(<scope>): <subject>
<BLANK LINE>

<body>
<BLANK LINE>
<footer>
```

The header is mandatory and the scope of the header is optional.

#### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body, it should say: `This reverts commit <hash>`., where the hash is the SHA of the commit being reverted.

#### Type

If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However, if there is any **BREAKING CHANGE**, the commit will always appear in the changelog.

Other prefixes are up to your discretion. Suggested prefixes are docs, chore, style, refactor, and test for non-changelog related tasks.

#### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

#### Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit Closes.

Breaking Changes should start with the word BREAKING CHANGE: with a space or two newlines. The rest of the commit message is then used for this.
