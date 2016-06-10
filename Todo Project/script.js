//Define List Model 
var List = Backbone.Model.extend({
    defaults:{
        name : '',
        created : '',
    },
});
//Define Item Model
var Item = Backbone.Model.extend({
    defaults:{
        description : '',
        due_date : '',
        status : false,
        list : null,
    },
});
//Collection for List 
var Lists = Backbone.Collection.extend({
    model : List,
    localStorage : new Backbone.LocalStorage('todo-lists'),
});
//Collection for Item
var Items = Backbone.Collection.extend({
    model : Item,
    localStorage : new Backbone.LocalStorage('todo-items'),
});
listCollection = new Lists();
itemCollection = new Items();
var ItemView= Backbone.View.extend({
    model : new Item(),
    events : {
        'click .item-edit-button': 'edit',
        'click .item-cancel-button' : 'cancel',
        'click .item-delete-button' : 'delete',
        'click .item-update-button' : 'update',
    },
    update : function(e)
    {
        var name = this.$('#item-description-update').val();
        var date =  this.$('#item-date-update').val();
        this.model.set('description',name );
		this.model.set('due_date', date);
        if(this.$('#item-status-update').is(":checked"))
            {
                this.model.set('status',true);
            }
        else
            {
                this.model.set('status',false);
            }
        this.model.save();
        itemView.render();
    },
    edit : function(e)
    {
        $('.item-edit-button').hide();
        $('.item-delete-button').hide();
        this.$('.item-update-button').show();
        this.$('.item-cancel-button').show();
        
        var name = this.$('.item-description').html();
		var date= this.$('.item-date').html();
        var status = this.$('.item-date-status').is(":checked");
        if(status)
            {
                this.$('.item-status').html('<input type="checkbox" class="form-control" id="item-status-update" checked>');
            }
        else
            {
                this.$('.item-status').html('<input type="checkbox" class="form-control" id="item-status-update">');
            }
        this.$('.item-description').html('<input type="text" class="form-control" id="item-description-update" value="' + name + '">');
		this.$('.item-date').html('<input type="date" class="form-control" id="item-date-update" value="' + date + '">');
    },
    delete : function(e)
    {
        this.model.destroy();
        itemView.render();
    },
    cancel : function(e)
    {
        itemView.render();
    },
    tagName : 'tr',
    my_template: _.template( $('.item-list-template').html()),
    render: function(){
        this.$el.html( this.my_template(this.model.toJSON()) );
        return this;    
    }
});
var ItemsView = Backbone.View.extend({
    el : $('.item-list'),
    initialize : function()
    {
       this.render();
    },
	render: function(){
        this.collection.fetch();
        $('.item-list').html('');
        this.collection.each(function(item){
            if(item.get('list') == ListId){
                var view = new ItemView({ model: item });
                this.$el.append(view.render().el);
            }
	   },this);
        return this;
	},
});
var ListView= Backbone.View.extend({
    model : new List(),
    tagName : 'tr',
    events : {
        'click .list-edit-button' : 'edit',
        'click .list-delete-button' : 'delete',
        'click .list-cancel-button' : 'cancel',
        'click .list-update-button' : 'update',
        'click .list-name' : 'openItems',
    },
    update : function(e)
    {
        var name = this.$('#list-name-update').val();
        var created =  this.$('#list-created-update').val();
        this.model.set('name',name );
		this.model.set('created', created);
        this.model.save();
        appView.render();
    },
    edit : function(e)
    {
        $('.list-edit-button').hide();
        $('.list-delete-button').hide();
        this.$('.list-update-button').show();
        this.$('.list-cancel-button').show();
        
        var name = this.$('.list-name').html();
		var created = this.$('.list-created').html();
        this.$('.list-name').html('<input type="text" class="form-control" id="list-name-update" value="' + name + '">');
		this.$('.list-created').html('<input type="date" class="form-control" id="list-created-update" value="' + created + '">');
    },
    cancel : function(e)
    {
        appView.render();
    },
    delete : function()
    {
        var id = this.model.get('id');
        this.model.destroy();
        itemCollection.each(function(item){
                item.destroy();
        },itemCollection)
        appView.render();
    },
    openItems : function(e)
    {
        var id = $(e.currentTarget).attr('id');
        ListId = id;
        var list = listCollection.get(id);  
        itemView = new ItemsView({collection :itemCollection});
        itemView.render();
        $('.modal-header').append(list.get('name'));
        appRouter.navigate('#post/'+id, true);
        
    },
    my_template: _.template( $('.list-list-template').html()),
    render: function(){
        this.$el.html( this.my_template(this.model.toJSON()) );
        return this;    
    }
});
var ListsView = Backbone.View.extend({
    el : $('.list-list'),
    initialize : function()
    {
       this.render();
    },
	render: function(){
        this.collection.fetch();
        $('.list-list').html('');
        this.collection.each(function(list){
            var view = new ListView({ model: list });
            this.$el.append(view.render().el);
	   },this);
        return this;
	},
});
var appView = null;
var ListId = 0;
itemView = new ItemsView({collection :itemCollection });
var Router = Backbone.Router.extend({
   routes :{
       '' : 'index',
       'post/:id' : 'dummy',
   },
    index : function()
    {
    },
    dummy : function(id)
    {
        if(ListId == 0)
            window.location.replace('index.html');
        $('#myModal').modal('show'); 
//        alert(list.get('name'));
    }
});
appRouter = new Router();
Backbone.history.start();
appView = new ListsView({collection : listCollection});

$(document).ready(function(){
    $('.add-list').on('click',function()
                     {
        var list = new List({
            name : $('.list-name-input').val(),
            created : $('.list-create-input').val()
        });
        console.log(list.toJSON());
        listCollection.add(list);
        list.save();
        appView.render();
        $('.list-name-input').val('');
        $('.list-create-input').val('');
    });
    $('#myModal').on('hidden.bs.modal', function (e) {
    // do something...
        window.location.replace('index.html');
    });
    $('.add-item').on('click',function()
                     {
        var item = new Item({
            description : $('.item-name-input').val(),
            due_date : $('.item-date-input').val(),
            status : false,
            list : ListId,
        });
        console.log(item.toJSON());
        itemCollection.add(item);
        item.save();
        itemView.render();
        $('.item-name-input').val('');
        $('.item-date-input').val('');
    });
});