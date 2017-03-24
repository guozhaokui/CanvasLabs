
## 20170324
修改tsconfig.json ,加了rootDirs选项，[".", "../runtime/runtimeMod"], 这样相当于 apps目录和 ../runtime/runtimeMod 目录是并列的了，这样引用就会容易一些。
paths的方法没有试成
为了保证实际require没有问题，现在是把基础库的outdir设到apps目录下了。