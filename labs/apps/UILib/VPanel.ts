
/**
 * 元素垂直排列
 * var p = new VPanel
 */

class Panel extends HTMLDivElement{
    height='100%';
    display='block';
    //font-size: 13px;
}

class VPanel extends Panel {

}

class HPanel extends Panel{

}

/**
 * 行内元素。 
 * TODO 都用div比较好
 */
class SpanItem extends HTMLSpanElement {
    cls='';
    //padding-left: 44px; 控制左边的对齐。这个是程序控制的
    //height: 22px;
}

/**
 
 var p = new VPanel;
 //居右
 1. p.css ='float:right'
 2. display: flex;  justify-content: flex-end; 
 */