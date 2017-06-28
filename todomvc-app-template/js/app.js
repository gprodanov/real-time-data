var NEW_ITEM_TEMPLATE =
    '<li class="<%= completeClass %>" data-id="<%= id %>">' +
    '<div class="view">' +
    '<input class="toggle" type="checkbox">' +
    '<label><%= text %></label>' +
    '<button class="destroy"></button>' +
    '</div>' +
    '<input class="edit" value="<%= text %>">' +
    '</li>';

const everlive = new Everlive({
    appId: 'btqzpbr4k8a0pe35',
    url: '//192.168.130.50:3000/v1/'
});

const todos = everlive.data('todos');

(async () => {
    initHandlers();

    let all = (await todos.get()).result;
    let active = (await todos.get({ complete: false })).result;
    let completed = (await todos.get({ complete: true })).result;
    let activeCollection = all;

    renderItems(true);

    todos.subscribe('create', data => {
        const todo = data.data;
        all.push(todo);
        if (todo.completed) {
            completed.push(todo);
        } else {
            active.push(todo);
        }

        renderItems(true);
    });

    todos.subscribe('update', data => {
        const todo = data.data;
        [all, active, completed].forEach(c => {
            const index = _.findIndex(c, i => i.Id === todo.Id);
            if (index > -1) {
                c[index] = todo;
            } else {
                //TODO: delete all completed, complete 2, delete again
            }
        });

        renderItems(true);
    });

    todos.subscribe('delete', data => {
        const todo = data.data;
        [all, active, completed].forEach(c => {
            const index = _.findIndex(c, i => i.Id === todo.Id);
            if (index > -1) {
                c.splice(index, 1);
            }
        });

        renderItems(true);
    });

    function listItemById(id) {
        return $('li[data-id="' + id + '"');
    }

    function destroyClickHandler(todoObject) {
        return function() {
            todos.destroySingle(todoObject.Id);
        };
    }

    function toggleClickHandler($li, todoObject) {
        return async function() {
            todoObject.complete = !todoObject.complete;
            try {
                await todos.updateSingle({
                    Id: todoObject.Id,
                    complete: todoObject.complete
                });
            } catch (err) {
                console.log(err);
            }
        };
    }

    function todoDoubleClickHandler($todo, $edit, todoObject) {
        return function() {
            $edit.val(todoObject.text);
            $todo.toggleClass('editing');
            setTimeout(function() {
                $edit.focus();
            });
        };
    }

    function editElementKeyupHandler($todo, $edit, todoObject) {
        return async function(e) {
            if (e.keyCode == 13) {
                //enter
                try {
                    await todos.updateSingle({
                        Id: todoObject.Id,
                        text: $edit.val()
                    });
                } catch (err) {
                    console.log(err);
                }

                $todo.toggleClass('editing');
            }
        };
    }

    function renderItems(clear) {
        let objects = activeCollection;

        $todoContainer = $('.todo-list');
        if (clear) {
            $todoContainer.empty();
        }

        objects = Array.isArray(objects) ? objects : [objects];
        objects.forEach(function(todoObject) {
            var compiledTemplate = _.template(NEW_ITEM_TEMPLATE);
            var model = {};
            model.id = todoObject.Id;
            model.text = todoObject.text;
            model.completeClass = todoObject.complete ? 'completed' : '';
            $todoElement = $(compiledTemplate(model));
            $todoElement.dataBound = todoObject;
            $toggle = $todoElement.find('.toggle');
            $toggle.prop('checked', todoObject.complete);
            $toggle.on('click', toggleClickHandler($todoElement, todoObject));
            $todoElement
                .find('.destroy')
                .on('click', destroyClickHandler(todoObject));
            $edit = $todoElement.find('.edit');
            $edit.on(
                'keyup',
                editElementKeyupHandler($todoElement, $edit, todoObject)
            );
            $todoElement
                .find('.view')
                .on(
                    'dblclick',
                    todoDoubleClickHandler($todoElement, $edit, todoObject)
                );

            if (todoObject.complete) {
                $todoContainer.addClass('completed');
            } else {
                $todoContainer.removeClass('completed');
            }

            $todoContainer.append($todoElement);
        });

        $('.todo-count').html(
            `<strong>${objects.length}</strong> item${objects.length === 1
                ? ''
                : 's'} left`
        );
    }

    function initHandlers() {
        var $todoInput = $('#todo-input');

        $todoInput.keyup(async function(e) {
            if (e.keyCode == 13 && $todoInput.val()) {
                try {
                    var res = await todos.create({
                        text: $todoInput.val(),
                        complete: false
                    });
                } catch (e) {
                    console.log(e);
                }

                $todoInput.val('');
            } else if (e.keyCode == 27) {
                $todoInput.val('');
            }
        });

        [
            $('.filter-all'),
            $('.filter-active'),
            $('.filter-completed')
        ].forEach(el =>
            $(el).on('click', function() {
                $('.filters .selected').toggleClass('selected');
                var el = $(this);
                if (el.hasClass('filter-active')) {
                    activeCollection = active;
                } else if (el.hasClass('filter-completed')) {
                    activeCollection = completed;
                } else {
                    activeCollection = all;
                }

                el.toggleClass('selected');
                renderItems(true);
            })
        );

        $('.clear-completed').on('click', function() {
            completed.forEach(i => todos.destroySingle(i.Id));
            renderItems(true);
        });

        var $filterButtons = $('.filter');
        $filterButtons.on('click', function() {
            $filterButtons.removeClass('selected');
            $(this).addClass('selected');
        });

        $('.toggle-all').on('click', function() {
            //TODO: element is not visible?
            var allComplete = all.every(function(todo) {
                return todo.complete;
            });
            var toggle = !allComplete;
            todoCollection.forEach(function(todo) {
                todos.updateSingle({
                    Id: todo.Id,
                    complete: toggle
                });
            });
        });
    }
})();
