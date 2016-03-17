***Circular Canvas menu***

HTML5 Canvas based menu in shape of circles. It provides differently colored segments with contrast text 

```javascript
    var segments = new Segments(ctx1, {startX: 300, startRadius:110, afterInit: afterSegmentsInit});
    
    function afterSegmentsInit(){
        segments.expandSegments()
    }
```
![alt canvas segment menu](segment.png)
[demo page](alex-volkov.github.io/canvas-circle-menu)