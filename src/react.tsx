import React, { useState } from 'react';
import { render } from 'react-dom';

const Index = () => {
  const [count, setCount] = useState(0);

  return (
    <div onClick={() => setCount(count + 1)}>
      Hello React!
      <br />
      count: {count}
    </div>
  );
};

render(<Index />, document.getElementById('app'));
