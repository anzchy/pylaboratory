# Playground Demo

pandas 模块测试：

```python packages=["pandas","numpy"] timeout=8000
import pandas as pd
import numpy as np

def generate_sim_numbers(rows=100, cols=5, random_seed=42):
    # 设置随机种子，确保结果可复现
    np.random.seed(random_seed)
    
    # 生成随机数字数据（这里用正态分布随机数，也可替换为整数等）
    data = np.random.randn(rows, cols)  # 生成rows行cols列的正态分布随机数
    
    # 构造DataFrame，列名用col1, col2...表示
    df = pd.DataFrame(data, columns=[f'col{i+1}' for i in range(cols)])
    
    # 打印前5行数据
    print("数据前5行：")
    print(df.head())
    print("\n数据形状（行数, 列数）：")
    print(df.shape)
    
    return df

# 调用函数示例（生成50行3列数据）
sim_df = generate_sim_numbers(rows=50, cols=3)

```

斐波拉契数列代码：
```python packages=["numpy"] timeout=8000
import numpy as np

def fibonacci(n):
    series = [0, 1]
    for _ in range(2, n):
        series.append(series[-1] + series[-2])
    return np.array(series)

print(fibonacci(10))
```



For 循环：

```python packages=[""] timeout=8000
def hello(name):
    return "Hello" + name

print(hello("Jack"))
```



