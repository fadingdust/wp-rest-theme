
## Test URIs Using Theme Unit Test Data

Read up on the [Theme Unit Test](https://github.com/WPTRT/theme-unit-test/), or just
[Download](https://raw.githubusercontent.com/WPTRT/theme-unit-test/master/themeunittestdata.wordpress.xml)
and import the data.

If the links below were in a `<router-link :to=""/>` it should load within Vue, not via Wordpress.
### Home/Blog:
/

### Pages:
/about/

/about/page-image-alignment/

### Archive: for /taxonomy-slug/term-slug or optionally /term-slug
/category-three/

/category/category-three/

### ArchiveDate:
/2017/10/

### Single Post:
/uncategorized/hello-world/

### Author:
/author/themedemos/

### Search:
/search/markup%20formatting

### 404:
/XYZ


## Alternatively, this code could be dropped into the theme-footer.vue
```
<router-link to="/">Home</router-link>

<router-link to="/about/">Page</router-link>
<router-link to="/about/page-image-alignment/">Child Page</router-link>

<router-link to="/category-three/">Archive</router-link>
<router-link to="/category/category-three/">Archive</router-link>

<router-link to="/2017/10/">ArchiveDate</router-link>

<router-link to="/uncategorized/hello-world/">Single Post</router-link>

<router-link to="/author/themedemos/">Author</router-link>

<router-link to="/search/markup%20formatting">Search</router-link>

<router-link to="/XYZ">404</router-link>

```
