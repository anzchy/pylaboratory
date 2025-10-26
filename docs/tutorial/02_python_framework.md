本节主要介绍 Python 学习的框架，包括重要的概念，有助于后续深入学习。



### 1、概念与定义

Definition: 

Each programming language has a set of primitive constructs, a syntax, a static semantics, and a semantics.

| 类比                 | English                                                      | Python                                                       |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| primitive constructs | words                                                        | literals and infix operators                                 |
| syntax               | describes which strings of words <br />constitute well-formed sentences | which strings of characters<br/> and symbols are well formed. |
| static semantics     | defines which sentences are meaningful                       | defines which syntactically <br/>valid stringshave a meaning. |
| semantics            | defines the meaning of those sentences.                      | associates a meaning with each<br/>syntactically correct string of symbols <br/>that has no static semantic errors. |



以下概念来自李笑来《自学是门手艺》

不管是Python、C语言、Java、C++、R等语言，所有编程语言的基本概念无非是以下这些：

- 数据：整数、布尔值；操作符；变量、赋值；表达式
- 函数、子程序、参数、返回值、调用
- 流程控制、分支、循环
- 算法、优化
- 程序：语句、注释、语句块
- 输入、处理、输出
- 解释器

几乎所有的编程入门教学书籍结构都差不多是由这些概念构成的。



###  1、data type



#### （1）数字 Nubmers

数字类型：Int float char

对于比较大的数字，可以用下划线表示，譬如 1000000，可以表示为`1_000_000`

①数字操作符

加：+

减： -

乘: *

除: /

取余:%

幂:**

一些例子：

```python
print(f"2 + 3 = {2 + 3}")
print(f"5 - 4 = {5 - 4}")
print(f"2 * 3 = {2 * 3}")
print(f"8 / 2 = {8 / 2}")
```

> 注：这个网站中的 Python 代码可以在线运行，你可以按照自己的想法编辑代码，然后点击左上角代码框的“运行”按钮，过一会就能在代码框的下方查看运行的结果。



②逻辑操作符：数字

== 判断两个值是否相当

!= 判断两个值是否不当

\>大于

< 小于

\>= 大于等于

<= 小于等于

in 属于关系，这个是Python中比较特殊的

```
print(f"2 > 3 = {2 > 3}")
print(f"5 != 4 = {5 != 4}")
print(f"2 == 3 = {2 == 3}")
print(f"2 in [2, 3] = {2 in [2, 3]}")
```



#### （2）布尔值

Python中，布尔值是True 或者False，任何逻辑表达式的结果，都会是其中之一

①布尔运算操作符

```python
print('(True and Flase) Yield: ', True and False)  #注意布尔值，是True，不是true 也不是TRUE，Python中注重大小写
... print('(True 0r Flase) Yield: ', True or False)
... print('(True and True ) Yield: ', True and True)
... print('(True 0r True ) Yield: ', True or True)
... print('(False and False ) Yield: ', False and False)
... print('(False 0r False ) Yield: ', False or False)
```

>  (True and Flase) Yield:  False 
>
>  (True 0r Flase) Yield:  True 
>
>  (True and True ) Yield:  True 
>
>  (True 0r True ) Yield:  True 
>
>  (False and False ) Yield:  False 
>
>  (False 0r False ) Yield:  False              

#### (3) data type 练习

```
print(type(abs(-7)))
# <class 'int'>
print(type(abs(-7.0)))
# <class 'float'>
print(type(abs))
# <class 'builtin_function_or_method'>
print(type(int))
<class 'type'>
```



### 2、流程控制

#### （1）if语句

if 语句，**选择性执行**

```python
import random
r = random.randrange(1, 1000)

if r % 2 == 0:
		print(r,"is even.")
else:
		print(r,"is odd.")
```

其中r 是变量 

r = random.randrange(1, 1000)，就是赋值语句



#### （2）**循环执行：**

① for 循环

```python
for i in range(10):
    if i % 2 != 0:
        print(i)
```

if 语句与for 语句的嵌套执行：

```python
for n in range(2,100):   #包含2，不包含100
    if n == 2:
        print(n)
        continue
    for i in range(2,n):
        if(n % i ==0):
            break
    else:
        print(n)
```

以上就是一套算法，不过是算法就可以优化，算法体现的是程序员的思维方式。



### 3、函数

> 函数在英文中称为 function，在Python 中也常称之为 Method。

函数是一个完整的程序，核心构成就是输入、处理、输出：

输入：能接收外部通过参数传递的值

处理：内部有能够完成某一特定任务的代码，尤其是可以根据“输入”得到“输出”

输出：能向外部输送返回值。

被调用的函数，也可以被理解为子程序（sub-Program），主程序执行到函数调用时，就开始执行实现函数的哪些代码，然后再返回主程序。

```python
#写一个判断指定数字是否是质数的函数

def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    for m in range(2, int(n**0.5)+1):
        if(n % m) == 0:
            return False
    else:
        return True
    
for i in range(80, 110):
    if is_prime(i):
        print(i)
```



###  4、Class 与 module

#### (1) Class 

Class 是 Python 面向对象编程的一个重要概念，什么时候需要 Class？当这个对象有很多个属性，并且有多个函数（方法），如果写很多个函数，会不易于管理与访问，所以最好定义一个 Class，将这些属性和对应的函数都 bind 到一个对象上。

譬如一个图书馆的图书管理系统，要处理成千上万本书的借入借出记录，书的属性有书名、ISBN 号、作者、入库时间等，方法有入库、借出、还书等。

```python
class Book:
    """图书类，包含图书的基本属性"""
    
    def __init__(self, title, isbn, author, publish_date, category):
        """
        初始化图书对象
        
        Args:
            title (str): 书名
            isbn (str): ISBN号
            author (str): 作者
            publish_date (str): 出版日期
            category (str): 图书分类
        """
        self.title = title
        self.isbn = isbn
        self.author = author
        self.publish_date = publish_date
        self.category = category
        
    def get_info(self):
        """获取图书详细信息"""
        info = {
            "书名": self.title,
            "ISBN": self.isbn,
            "作者": self.author,
            "出版日期": self.publish_date,
            "分类": self.category,
        }
        return info
      
   
```

#### （2）module

我们在一个项目文件夹中创建两个文件`hello.py`和`main.py`

> 注意如下的代码，在本网站无法在线运行。

hello.py内容：

```
# hello.py内容
def say_hello(name):
		return "Hello "+ name
    

```

main.py内容：

```
from hello import say_hello
print(say_hello("Jack"))
```

