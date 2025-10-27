# 自序：笔者的Python 编程学习之路

在2024 年初的时候，笔者还是一个完全的 Python 编程小白，如今两年过去了，世界发生了沧海桑田的变化，而我自己也成长了很多，值此1024 程序员节，应景写下这篇自序，介绍我的坎坷但是还算幸运的 Python 学习之旅，希望给你带来启发、激励。



我高中学的是理科，大学学了经管专业，课程设置中有 C++编程，学了之后也忘了。当然上完课，相关内容也就还给老师了。

![image-20251026153920374](https://picbox-1313243162.cos.ap-nanjing.myqcloud.com/typora/image-20251026153920374.png)

后来在毕业工作后，也短暂地挣扎过想学 Python 或者 C 语言，买过谭浩强（C 语言学习者人手一本）的绿皮书，下载了无数的 Python电子书教程（如《Python 简明编程》），但是始终看了第一章后就没有后续了。

时间辗转来到 2024 年，这一年我跟着李笑来老师学了一年的英语，中间经常见到李笑来老师发一些 Python 脚本，就挺好奇想去研究研究，时不时还推荐他自己写的的《自学是门手艺》（一本以 Python 编程学习）这本书。

有了笑来老师给的信心，我开始写代码了，刚翻了下我的 github repo，2024 年 8 月 14 日开启了正式的 Python 自学编程之路。

![image-20251026160342565](https://picbox-1313243162.cos.ap-nanjing.myqcloud.com/typora/image-20251026160342565.png)

这一次和之前学习不一样的是：有了 AI 的加持，很多Python 问题可以直接复制粘贴给 ChatGPT，而 ChatGPT 可以给到很及时专业的解答，这对于初学者来说非常重要。

一来二去，我逐步从写几行代码，到写几十行代码，到开始写一些感兴趣的小项目，譬如从Cambridge.dict 词典中查询特定英语音标对应的英文单词。在工作过程中，发现有些流程有很大的重复性，我就尝试在 ChatGPT 的帮助下实现。举一个例子：

我本职工作中，常常要隔半年整理一下自己手上在管项目的文件，并输出文件中子文件夹和子文件夹中文件的目录。换成之前，我可能一边开着 Excel软件一边打开文件管理器，然后复制文件名，粘贴到 Excel 中，周而复始。这一次，我就尝试用 Python 来解决这个问题，在 ChatGPT 的帮助下，我认识到有 Pathlib 这个 module，以及 Python 自带的 os module 可以帮我解决这个问题。于是我就写了一个 Python 脚本，成功完成这个任务。

![image-20251026161545656](https://picbox-1313243162.cos.ap-nanjing.myqcloud.com/typora/image-20251026161545656.png)

当我做了一些项目，高效地完成了工作之后，我的自信心就更加增加，于是进一步挑战更难的项目。开始进入到一些细分领域。

- 网页爬虫

譬如写一些爬虫，爬取感兴趣的网页中的表格，为此学习了 Playwright，Requests 等工具，了解到了 API Test 工具 postman、Hoppscotch（开源）等。

- 数据分析

本职工作也需要接触大量的数据分析，于是了解到了 numpy 和 pandas 模块，之前类似的数据处理都是在 Excel 中，也花了一些时间研究 Excel，现在可以都用 pandas 解决了。今年 Q1 报名了刑大的量化编程课程，正式开启了 Python 量化编程之旅，其中综合应用了网页爬虫和 pandas 相关知识，也顺便进一步夯实了 Python 编程知识。



到了 2025年，随着 AI 编程工具如 Claude Code 和 Openai Codex Cli 的推出，我开始有信心挑战更为复杂的编程项目了，重点以量化编程项目为例进行实操。其中会涉及数据收集 -> 数据清洗 -> 数据分析等步骤。到目前为止，我在云端Windows 服务器托管了4-5 个项目，每个工作日收盘后定期运行收集数据，比较复杂的项目代码在数百行到上千行不等。



## 如果让我重新来过，我应该怎么学 Python 编程？

首先兴趣是学习的一半，有兴趣才会驱使你度过枯燥的平台期。我本身对编程是感兴趣的，本职工作也要接触 AI 等前沿知识，刚好两者相得益彰。

其次，好的教程也非常重要，我通过 ChatGPT 了解到了 Python 领域的一些好的教程和网站，譬如 Al Sweigart 的《Automate the boring stuff with Python》就很经典，相关教程也开源，可以访问这个[网站](https://automatetheboringstuff.com/)；如果你喜欢看视频的话，Harvard University的 CS50系列中 [Python课程](https://cs50.harvard.edu/python)值得一追，讲师David J. Malan 把 Python 知识掰开揉碎了讲给你听，而且还配套有字幕。

![image-20251026163514024](https://picbox-1313243162.cos.ap-nanjing.myqcloud.com/typora/image-20251026163514024.png)

其他的资源简单列举，不分先后：

- [Python offcial tutorials](https://docs.python.org/3.14/): Python 官方的文档应该是你遇到问题，第一个去搜索的地方。当然，现在有了 AI 聊天工具，很多时候我直接把需求告诉豆包或者 ChatGPT，让它帮我写一些范例代码。

- [TechwithTim](https://www.youtube.com/c/TechWithTim): 一个加拿大的哥们，主要讲 Python 知识，有很多基于 Python 的 web project 和 pygame 项目等手把手教你从零到一完成项目，我过年的时候在家尝试用 pygame写了一个飞机坦克大战的项目。
- [Real Python](https://realpython.com/)：一个老牌的以 Python 知识为主的网站，知识点非常全面。
- [Reuven M. Lerner](https://github.com/reuven):  自由职业者，以Python 和 pandas 培训为生，主要讲 Pandas 知识，他的 Github 我经常去看看，会有最新的 Pandas 的一些 ipynb 教学文件公开出来。
- [Matt Harrison](https://hairysun.com/)：写了 《Effective pandas》、《Effective polars》等书籍，还挺不错的。

最后，“纸上得来终觉浅”，还是要上手实操，一些代码看起来简单，但是等你自己实操的时候，会发现这样或那样的问题，你会发现“魔鬼藏在细节中”，可以先跟着教程中的代码自己实现一遍，结果要完全一样，此刻你才真的和作者进行了有效的对话，之后你可以尝试改改其中的一些参数的数值，为了了解代码运行的过程，你可以在中间多加一些 print 代码。

上手项目的时候，先从感兴趣的小项目开始做，尤其是抓住工作、生活中流程具有重复性的一些任务，看看能否编程实现。

在整个实操过程中，不要忘了你有专属的 AI 编程助理，可以随时响应你的个性化需求。



以上是我的自序，由于我是从完全小白一步步成长起来的，我知道Python 初学者在过程中遇到的各种坑。因此我打算将之前学习的 Python 编程知识进一步整理，发布到这个网站。这对于我来说，也是重新梳理、提升自己系统化思考能力的一个过程。而对于读者你来说，我希望能激发你对于 Python 编程的兴趣，增加你的信心，只要你想学，在 AI 时代学 Python 比任何时候都更容易。

> Whenever there is a will, there is a way.









