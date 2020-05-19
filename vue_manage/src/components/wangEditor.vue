<template lang="html">
  <div class="editor">
    <div ref="toolbar" class="toolbar">
    </div>
    <div ref="editor" class="text">
    </div>
  </div>
</template>

<script>
  import E from 'wangeditor'
  export default {
    name: 'editoritem',
    data() {
      return {
        // uploadPath,
        editor: null,
        info_: null,
        token:null,
      }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    props: {
      value: {
        type: String,
        default: ''
      },
      isClear: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      isClear(val) {
        // 触发清除文本域内容
        if (val) {
          this.editor.txt.clear()
          this.info_ = null
        }
      },
      value: function(value) {
        if (value !== this.editor.txt.html()) {
          this.editor.txt.html(this.value)
        }
      }
    },
    mounted() {
     /*  this.gettoken() */
      this.seteditor()
      this.editor.txt.html(this.value)
    },
    methods: {
        gettoken(){
            this.$axios({
                url:'/issue/gettoken',
                methods:'get',
            }).then(res => {
                this.token=res.data.data
                console.log(this.token);
            })
        },
      seteditor() {
        
        this.editor = new E(this.$refs.toolbar, this.$refs.editor)
        this.editor.customConfig.uploadFileName = 'file'
        this.editor.customConfig.uploadImgServer = 'http://192.168.199.111:3000/file_upload' 
        this.editor.customConfig.showLinkImg = false
        this.editor.customConfig.uploadImgMaxSize = 5 * 1024 * 1024 // 将图片大小限制为 2M
        this.editor.customConfig.uploadImgTimeout = 3 * 60 * 1000 // 设置超时时间
        this.editor.customConfig.menus = [
          'head', // 标题
          'bold', // 粗体
          'fontSize', // 字号
          'fontName', // 字体
          'italic', // 斜体
          'underline', // 下划线
          'strikeThrough', // 删除线
          'foreColor', // 文字颜色
          'backColor', // 背景颜色
          'link', // 插入链接
          'list', // 列表
          'justify', // 对齐方式
          'quote', // 引用
          'emoticon', // 表情
          'table', // 表格
          'image',
          'code', // 插入代码
          'undo', // 撤销
          'redo', // 重复
          'fullscreen' // 全屏
        ]
        this.editor.customConfig.uploadImgHooks ={
          success:function (xhr, editor, result) {
            console.log(xhr);
            let img=`<img src=${result.data[0]} alt='movevi' />`
            editor.txt.html(img)
          },
        }
        this.editor.customConfig.onchange = (html) => {
          this.info_ = html // 绑定当前逐渐地值
          this.$emit('change', this.info_) // 将内容同步到父组件中
        }
        // 创建富文本编辑器
        this.editor.create()
      },
      
       

    }
  }
</script>

<style lang="css">
  .editor {
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: 0;
  }
  .toolbar {
    border: 1px solid #ccc;
  }
  .text {
    border: 1px solid #ccc;
    min-height: 500px;
  }
</style>