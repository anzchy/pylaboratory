# Playground Demo

```python packages=["numpy"] timeout=8000
import numpy as np

def fibonacci(n):
    series = [0, 1]
    for _ in range(2, n):
        series.append(series[-1] + series[-2])
    return np.array(series)

print(fibonacci(10))
```
