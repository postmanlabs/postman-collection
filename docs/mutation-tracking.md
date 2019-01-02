### Introduction

A mutation represents a change to the state of an object. To track a mutation would mean to capture the transition from
one state to another. This means capturing the state transition as a serializeable object that can be transported and
reapplied on an different object. Once captured the same mutation when applied on two separate objects with same initial
state should transition them to the same final state.

### When would you need need to track mutations?

Let's take executing collection scripts in `postman-sandbox` for example. Let's say you pass down an environment and a
script that updates your environment, to the sandbox to execute. Once the script finishes executing you would get the
final state of the environment after the updates. Now you have the final state of the environment. But you do not know
what updates the script did to your environment. Also you do not know all the intermediate states of the environment
when the script was executing.

Now imagine you could track every change to the environment and get it at the end of script execution. You can replay
them again from an initial state, pause at any point and continue. Mutation tracking can help you with that.

You would typically want to track mutations when you want to track individual changes to an object and store/transport
them. You might also need mutation tracking when you want to observe changes on an object and replay them on a different
object to achieve mirroring.

### Basic Components

* **Mutation**: The basic component of mutation tracking system is an individual mutation. This captures a single change.
A mutation is serializeable and can be applied to any object of the similar type.
* **MutationTracker**: Mutation tracker collects a sequence of mutations and provides helpers to work with mutations, like
applying them on a new object. The mutation tracker can also optimize the sequence of mutations, like compressing them.

## Representing a mutation

Every mutation has four parts

* **Target**              - The origin of the mutation
* **Key Path**            - Path to the property of the target that got mutated
* **Instruction**         - The nature of mutation
* **Value (Optional)**    - The payload for the instruction

To capture all the information in an optimized format we use a serialization spec based on - JSON Delta (http://json-delta.readthedocs.io/en/latest/)

An example `set` operation would look like - `['foo', 1]`

If we break this down

```
sample.mutations = [['foo', 1]]
  |                     |___|_______ Key Path
  |                         |_______ Value
  |_________________________________ Target
```

You would have noticed that the instruction is not explicitly captured. That's because it is derived from the parameter set.

For example an unset operation would look like `['foo']`.

Which means you can derive the instruction based on the shape of the mutation itself. A mutation with single parameter
would imply an unset operation. A mutation with two parameters would imply a set operation.

### Mutation tracking in Variable Scopes

To track mutations in a Postman Variable Scope, you can enabled it like

```js
var VariableScope = require('postman-collection').VariableScope,
    environment = new VariableScope();

// enables tracking mutations
environment.enableTracking();
```

From this point onwards any `set/unset/clear` operations on `environment` will be captured in in `environment.mutations`.

You can then apply the same mutation on a different object like

```js
var environmentCopy = new VariableScope();

// applies the mutations captured on `environment` into `environmentCopy` making it a mirror
environment.mutations.applyOn(environmentCopy);
```

### Limitations and scope for extension

Postman collection SDK supports tracking mutations on `VariableScopes`. We could apply the same concepts to any type
of object not restricted to a `VariableScope`.

In practise more complex types would have complex instructions that are not restricted to `set/unset`. To capture those
we might have to extend our representation for a mutation to support more complex instructions.

We will have to capture the instruction explicitly in that case. To do so we can think of something like

```
['id', 'addRequest', '#', '1', 'request1']
   |________|_________|____|________|___________ Mutation Id
            |_________|____|________|___________ Instruction
                      |____|________|___________ Delimiter to differentiate from first generation mutations
                           |________|___________ Key Path
                                    |___________ Value
```