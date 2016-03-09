# vue-dependon

> The simplest way to chain select boxes in vue.js!

Nothing too much to say about it! All you have to know is that you can chain
multiple select boxes together by saying: “this select box **depends on** that
select box”.

![Example of vue-dependon](assets/example.gif?raw=true)

## Setup

```
npm install vue-dependon --save
```

You have two ways to setup *vue-dependon*:

#### CommonJS (Webpack/Browserify)

- ES6

```js
import VueDependOn from 'vue-dependon'
Vue.use(VueDependOn)
```

- ES5

```js
var VueDependOn = require('vue-dependon')
Vue.use(VueDependOn)
```

#### Include

Include it directly with a `<script>` tag. In this case, you don't need to write
`Vue.use(VueDependOn)`, this will be done automatically for you.

## Usage

Let's take a look at a simple example.

We'll use the typical example of Country-City select boxes.

``` html
<!-- Country -->
<select v-model="selectedCountry" id="country">
    <option v-for="location in locations" :value="location.country">
        {{ location.country }}
    </option>
</select>

<!-- City -->
<select v-dependOn="locations.country" id="city">
    <option v-for="city in loadedCityOptions" :value="city">
        {{ city }}
    </option>
</select>
```

``` js
new Vue({
    el: '#app',

    data: {
        locations: [
            {
                country: 'Country1',
                city: ['City1 in country1', 'City2 in country1', ...]
            },
            {
                country: 'Country2',
                city: ['City1 in country2', 'City2 in country2', ...]
            },
            // ...
        ],
    }
});
```

First of all, you need to set an identifier for each select box using their `id`
attributes. This identifier should match the name of the property you defined in
your vm.

In this case, *country* is the parent select box. And for parent(s) we have to
bind the select box (using `v-model`) to a variable named
`selected[idOfSelectBox]`. So this is a convention; in our case it's
`selectedCountry`.

Note that we only do this for parent select boxes. So, if the city select box is
also a parent for another select box, we'll need bind it to `selectedCity`.

To link our child select box to a parent, we have to use the directive
`v-dependOn`, which we give it the data path of the parent we want to depend on.
So, in this case, we gave it `locations.country`.

The last thing you have to do, after linking your child select box to its
parent, is to display its options but this time using a different source of
data. So, instead of using `locations` in the `v-for`, we used
`loadedCityOptions`. This is another convention you have to know:
`loaded[childId]Options`.

### Steps summary

1. Set the `id` of each select box according to the data you want to use in your vm.
2. Bind every parent to `selected[id]` using `v-model`.
3. Use the directive `v-dependOn` on child select boxes. And provide them with the path of the parent you want to depend on.
4. Display all options `<option>` in the child boxes using the convention: `loaded[childId]Options`.

### Loading data asynchronously

In many cases, you'll need to fetch data asynchronously using Ajax. So, instead
of hard coding *countries & cities* directly, you'll fetch them from a server, for
example.

Luckily, it's so easy to allow for this in *vue-dependon*. All you have to do is
to tell the plugin about it using the modifier `async`. Like this:
`v-dependOn.async="locations.country"`.

Note that if you specified that, and the data took more than 5 seconds to be
fetched, the plugin will throw a *timeout exceeded* exception.

### Chaining more than two select boxes

With *vue-dependon* you can chain as many select boxes as you want. There's
nothing special you want to know in order to do that. It's the same steps.
Having said that, here's what I think worth mentioning:

If we were to add a third select box to our example — as a child for city —
we'll need to define another data list in our vm, like this:

``` js
data: {
    locations: [
      country: 'FooCountry',
      city: ['FooCity', 'BarCity']
    ],
    addresses: [
      {
        city: 'FooCity',
        street: ['FooStreet1', 'FooStreet2']
      },
      {
        city: 'BarCity',
        street: ['BarStreet1', 'BarStreet2']
      }
    ]
}
```

Lastly, for this to work, you need to make sure that you've converted your
*city* select box to a parent by using `v-model="selectedCity"`.

## Conventions

#### Data

- `selected[parentId]`: This is what you'll use (binding with `v-model`) to tell a select box to work as a parent.
- `loaded[childId]Options`: The option list that you'll display in a child select box.
