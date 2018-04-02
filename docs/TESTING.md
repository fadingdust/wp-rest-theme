
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

## Custom PostTypes
/custom-post-type/ (/news/)

/custom-post-type/post-name/ (/news/news-item-1)

/custom-taxonomy/custom-term/ (/news_type/breaking)


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
/X/Y
/X/Y/Z ...

### TODO:
/2017/10/post-name (wordpress redirects)

/custom-taxonomy/ (404)

/custom-post-type-post-name/ (404)

/custom-term/post-name/ (wordpress redirects to /custom-post-type/post-name/)

/custom-post-type/custom-term/  (Considers 'custom-term' a post_slug)

/custom-post-type/custom-taxonomy/ (Considers 'custom-term' a post_slug)

/custom-post-type/custom-taxonomy/custom-term/

/custom-post-type/custom-taxonomy/custom-term/post-name/


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
