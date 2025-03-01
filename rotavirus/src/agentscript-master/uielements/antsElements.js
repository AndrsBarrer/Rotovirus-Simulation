export default [
    {
        id: 1729270887157,
        type: 'output',
        name: 'ticks',
        position: {
            x: 342,
            y: 21,
        },
        monitor: 'model.ticks',
        fps: '10',
        command: null,
    },
    {
        id: 1729463191305,
        type: 'range',
        name: 'patchesSize',
        command: "view.setValue('patchesSize', value)",
        position: {
            x: 172,
            y: 21,
        },
        min: '1',
        max: '20',
        step: '1',
        value: '12',
    },
    {
        id: 1730141024864,
        type: 'checkbox',
        name: 'Run',
        command: 'checked ? anim.start() : anim.stop()',
        position: {
            x: 20,
            y: 21,
        },
        checked: false,
    },
    {
        id: 1733442807622,
        type: 'dropdown',
        name: 'fps',
        command: 'anim.setFps(value)',
        position: {
            x: 100,
            y: 21,
        },
        options: ['2', '5', '10', '20', '30', '60'],
        selected: '30',
    },
    {
        id: 1729535684833,
        type: 'button',
        name: 'Save',
        command: 'downloadJson()',
        position: {
            x: 405,
            y: 21,
        },
    },
    {
        command: 'reset()',
        id: 1728927569824,
        name: 'Reset',
        position: {
            x: 405,
            y: 60,
        },
        type: 'button',
    },
    {
        id: 1729464380401,
        type: 'range',
        name: 'turtleSize',
        command: "view.setValue('turtlesSize', value)",
        position: {
            x: 33,
            y: 158,
        },
        min: '1',
        max: '10',
        step: '1',
        value: '4',
    },
    {
        id: 1729638667060,
        type: 'dropdown',
        name: 'shape',
        command: "view.setValue('turtlesShape', value)",
        position: {
            x: 396,
            y: 160,
        },
        options: ['circle', 'dart', 'person', 'bug', 'arrow'],
        selected: 'bug',
    },
    {
        id: 1731189397631,
        type: 'output',
        name: 'foodSeekers',
        command: null,
        position: {
            x: 290,
            y: 159,
        },
        monitor: 'model.foodSeekers',
        fps: '10',
    },
    {
        id: 1732139806352,
        type: 'plot',
        name: 'foodSeekers & nestSeekers',
        command: null,
        position: {
            x: 21,
            y: 299,
        },
        width: '450',
        height: '150',
        pens: ['foodSeekers', 'nestSeekers'],
        fps: '60',
    },
    {
        id: 1732212640249,
        type: 'output',
        name: 'nestSeekers',
        command: null,
        position: {
            x: 192,
            y: 159,
        },
        monitor: 'model.nestSeekers',
        fps: '10',
    },
]
