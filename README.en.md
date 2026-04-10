[Demo Image Click to view effect (GIF animation may not display properly due to network issues, and video-converted GIFs may stutter. For the best experience, download the example and run it locally on your computer.)](sslocal://flow/file_open?url=http%3A%2F%2F47.119.142.242%2Fstatic%2Ftowxml-stream-typer.gif&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

# towxml-stream-typewriter

> ##### For issues, contact me on WeChat: zxx-wwj-zbl

[towxml source code & stream typewriter implementation walkthrough video](sslocal://flow/file_open?url=https%3A%2F%2Fwww.bilibili.com%2Fvideo%2FBV1hE3Fz8EVu%2F%3Fspm_id_from%3D333.337.search-card.all.click%26vd_source%3D0509c88161931dba2d7404110af17c0f&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

### Background & Core Pain Points

With the widespread use of large AI models in WeChat Mini Programs and cross-end scenarios, streaming Markdown output via SSE/WebSocket has become a standard feature for AI chatbots.
However, the popular Mini Program Markdown rendering library [towxml](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fsbfkcel%2Ftowxml&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=) suffers from critical performance issues in streaming LLM response scenarios:

- During streaming rendering, the library **re-parses and re-renders the entire accumulated text**; parsing and rendering overhead grows exponentially with text length.

- In long-text scenarios, typing speed drops sharply, devices overheat and frame-drop, complex nodes are repeatedly created, and frequent `setData` calls can even freeze pages or crash Mini Programs.

- Performance degrades continuously after multiple rounds of conversation, creating a major technical bottleneck for AI chat in Mini Programs.

> 💡 If this project solves your real-world problems, please give it a **⭐ Star** to support me!
> Your encouragement is my biggest motivation to keep optimizing and adding new features~

### Solution

To address these issues, I heavily modified the original towxml source code to create the `towxml-stream-typer` component, with the following core breakthroughs:

✅ **Core Technical Innovations**: Two key design principles — **partial rendering of incremental text** and **stable node reuse for consistent layout** — eliminate redundant parsing and rendering at the source.
Only newly added text segments are parsed; already rendered stable nodes (paragraphs, lists, code blocks) are fully reused without re-conversion or re-rendering.

✅ **Extreme Performance**: Tested on both Android and iOS, streaming rendering maintains consistent speed even for 40+ minutes of long text.
A 50,000-word Markdown document renders in just 4 minutes 30 seconds (only 20 seconds slower than theoretical limits).
For 200,000-word multi-round conversations, the time difference across rounds is ≤ 2 seconds.
The "slower as conversation grows" problem is completely resolved.

In theory, this solution ensures **consistently smooth performance** regardless of text length.

### Compatibility

This library currently supports:
- Native WeChat Mini Programs
- uniapp (Vue 3)
- Taro

Use after building with `npm run build`; code protection in WeChat DevTools is supported.

Due to underlying modular differences, usage in `uniapp Vue2` may require extra adjustments.
Since uniapp Vue2 is rarely used today, no dedicated demo is provided.
Feel free to contact me on WeChat if you need support.

### Usage

Download the project, enter the `towxml` directory, and run:

- **npm install**

- **npm run build**
  Before building, you may configure in `config.js` whether to bundle echarts, latex, yuml, etc.
  Default bundle size is around 309KB (minimal). A `dist` folder will be generated.

- Rename `dist` to `towxml` and place it in your Mini Program / uniapp project as a native WeChat Mini Program component.

Example projects are provided for reference:

[uniapp Example](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fzhouzxx%2Ftowxml-stream-typewriter-uniapp-example&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

[Native WeChat Mini Program Example](sslocal://flow/file_open?url=https%3A%2F%2Fgithub.com%2Fzhouzxx%2Ftowxml-stream-typewriter-weChat-example&flow_extra=eyJsaW5rX3R5cGUiOiJjb2RlX2ludGVycHJldGVyIn0=)

***It is strongly recommended to follow one of these examples. The code is well-commented and includes best practices: loading history messages, scrolling to bottom, aborting printing, pausing auto-scroll, one-tap scroll-to-bottom, etc.***

### Details

##### 1. Component props have changed due to customized towxml code

##### 2. Available props:

| Prop name   | Type    | Description | Default |
|-------------|---------|-------------|---------|
| id          | String  | Unique component ID (required, used as key for global state) | Required |
| speed       | Number  | Character typing interval (ms) | 6 |
| openTyper   | Boolean | Enable typewriter effect; set to `false` for full Markdown render | true |
| theme       | String  | Support `dark` / `light`; `light` recommended | light |

##### 3. Events

`finish`: Emitted when typing completes. Use this to clear auto-scroll timers.

`historyMessageFinish`: Called when each history message finishes rendering.

##### 4. Global functions (import from `towxml/globalCb.js`)

| Function name         | Parameters                  | Description |
|-----------------------|-----------------------------|-------------|
| setMdText             | (id, text)                  | Update full Markdown text for the given component ID when new stream chunks arrive |
| setStreamFinish       | (id)                        | Notify that streaming for current response is complete |
| stopImmediatelyCb     | (id)                        | Abort typing immediately for the given component |
| scrollCb              | (e)                         | Call in `scroll-view` `onScroll` to enable virtual rendering and memory optimization |
| setQueryTowxmlNodeFn.value | Function assignment | Provide a node query function to get component top positions for virtual rendering |

> Both `scrollCb` and `setQueryTowxmlNodeFn` are required for virtual rendering to work properly.
> Without them, the component still functions but memory usage accumulates, which may lead to WeChat killing the Mini Program.

> Logs indicating virtual rendering is active:
![image](https://github.com/user-attachments/assets/08481834-b254-4cf9-9f9f-34578d4f5350)

> For detailed usage, refer to the uniapp or native WeChat examples above.

##### 5. Updating

When the source code is updated, simply download the new `towxml` folder，build and replace your local version.
New features may require minor adjustments in demo code.
