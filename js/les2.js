(function() {
  window.set_col_width = function(table, col_index, width) {
    var each_row;
    each_row = function(row) {
      var cell;
      cell = $($('td,th', row)[col_index]);
      return cell.css({
        width: width
      });
    };
    return _.each($('tr', table), each_row);
  };
  $(function() {
    $('#org_select').focus();
    /*
       view for managing each header row
      */
    window.TableHeader = Backbone.View.extend({
      template: _.template($('#list_complex_header_t').html()),
      initialize: function() {
        return this.def = this.options.def;
      },
      render: function() {
        var header_row, header_row_view, headers, new_def, _i, _len;
        delete this.el;
        headers = window.app.current_lang === 'en' ? this.def.headers_e : this.def.headers_f;
        if (_.all(headers, function(x) {
          return _.isArray(x);
        })) {
          for (_i = 0, _len = headers.length; _i < _len; _i++) {
            header_row = headers[_i];
            new_def = {
              headers_e: header_row,
              headers_f: header_row
            };
            header_row_view = new TableHeader({
              def: new_def
            });
            header_row_view.render();
            if (_.isUndefined(this.el)) {
              this.el = header_row_view.el;
            } else {
              this.el = this.el.add(header_row_view.el);
            }
          }
        } else {
          this.el = $(this.template({
            list: headers
          }));
        }
        return this;
      }
    });
    /*
       view for managing each footer row
      */
    window.TableFooter = Backbone.View.extend({
      template: _.template($('#list_footer_t').html()),
      initialize: function() {
        return this.footer_data = this.options.footer_data;
      },
      render: function() {
        this.el = $(this.template({
          list: this.footer_data
        }));
        return this;
      }
    });
    /*
        view for managing each table row
      */
    window.TableRow = Backbone.View.extend({
      template: _.template($('#list_row_t').html()),
      initialize: function() {
        return this.data = this.options.data;
      },
      render: function() {
        this.el = $(this.template({
          list: this.data
        }));
        return this;
      }
    });
    /*
        make comments about the following
        used as both a container of tables and as actual tables
        more comments
      */
    window.TableCollection = Backbone.View.extend({
      initialize: function() {
        var data;
        data = this.options.data;
        this.def = this.options.def;
        this.title = this.options.title;
        this.total_cols = this.options.total_cols;
        this.rows = _.map(data, this.row_mapper);
        if (!_.isUndefined(this.template)) {
          return this.el = $(this.template({
            title: this.title
          }));
        }
      },
      row_mapper: function(row) {
        /* 
          fix or lookup any missing information for each table
        */        return row;
      },
      header: function() {
        /*
              this function could be overwritten
              */        var header;
        if (!_.isUndefined(this.def)) {
          /*
                  create a header element
                  render the header
                  return the header
                 */
          header = new TableHeader({
            def: this.def
          });
          header.render();
          return header;
        } else {
          return {
            el: $('<td></td>')
          };
        }
      },
      total_footer: function() {
        /* 
         this function could be overwritten
         make copy of first row as footer 
        */        var each_total_col, footer, footer_data;
        footer_data = _.map(this.rows[0], function(x) {
          return '';
        });
        /* 
           for each footer identified
           first extra the column of data
           then set the footer equal to the sum of that column 
        */
        each_total_col = function(i) {
          var col;
          col = _.map(this.rows, function(x) {
            return x[i];
          });
          return footer_data[i] = _.reduce(col, function(x1, x2) {
            return x1 + x2;
          });
        };
        _.each(this.total_cols, each_total_col, this);
        footer = new TableFooter({
          footer_data: footer_data
        });
        footer.render();
        return footer;
      },
      render: function() {
        /* each table or collection of tables should 
        # fill out this function
        */        return this;
      }
    });
    window.simpletable = TableCollection.extend({
      template: _.template($('#list_t').html()),
      render: function() {
        /* 
         add in the header 
         add in the footer 
         populate the data 
        */        var row, row_view, table, _i, _len, _ref;
        $('thead', this.el).append(this.header().el);
        $('tfoot', this.el).append(this.total_footer().el);
        table = $('tbody', this.el);
        _ref = this.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          row_view = new TableRow({
            data: row
          });
          row_view.render();
          table.append(row_view.el);
        }
        /* 
        transform the table into a jQuery dataTable
        */
        window.el = $('table', this.el);
        return this;
      }
    });
    /* the logic for the actual LES tables */
    window.tables = {
      data2: TableCollection.extend({
        totals: [2, 3, 4, 5, 6, 7],
        row_mapper: function(r) {
          var lookup;
          console.log(r);
          if (r[1] === 's') {
            lookup = stat_en_fr[r[2]];
          } else {
            lookup = in_year_vote[r[0] + ":" + r[1]];
            lookup = vote_type_inyear[lookup];
          }
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        },
        render: function() {
          var stat_table, voted_table;
          voted_table = new simpletable({
            data: _.filter(this.rows, function(x) {
              return !(x[0] === 's');
            }),
            def: this.def,
            total_cols: this.totals,
            title: "Voted Authorities"
          });
          stat_table = new simpletable({
            data: _.filter(this.rows, function(x) {
              return x[0] === 's';
            }),
            def: this.def,
            total_cols: this.totals,
            title: "Statutory Authorities"
          });
          $(this.el).append("<h1>" + this.title + "</h1>");
          $(this.el).append(voted_table.render().el);
          $(this.el).append(stat_table.render().el);
          return this;
        }
      }),
      data2a: TableCollection.extend({
        totals: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        row_mapper: function(r) {
          return r.slice(1);
        },
        render: function() {
          var table;
          $(this.el).append("<h1>" + this.title + "</h1>");
          table = new simpletable({
            data: this.rows,
            def: this.def
          });
          $(this.el).append(table.render().el);
          return this;
        }
      }),
      data3: TableCollection.extend({
        row_mapper: function(r) {
          var key, lookup;
          key = r[0] + ":" + r[1];
          lookup = in_year_vote[key];
          lookup = vote_type_inyear[lookup];
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        },
        render: function() {
          var table;
          $(this.el).append("<h1>" + this.title + "</h1>");
          table = new simpletable({
            data: this.rows,
            def: this.def
          });
          $(this.el).append(table.render().el);
          return this;
        }
      }),
      data4: TableCollection.extend({
        row_mapper: function(r) {
          var key, lookup;
          key = r[0] + ":" + r[1];
          lookup = hist_vote[key];
          lookup = vote_type_hist[lookup];
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        },
        render: function() {
          var table;
          $(this.el).append("<h1>" + this.title + "</h1>");
          table = new simpletable({
            data: this.rows,
            def: this.def
          });
          $(this.el).append(table.render().el);
          return this;
        }
      }),
      data5: TableCollection.extend({
        row_mapper: function(r) {
          var key, lookup;
          key = r[0] + ":" + r[1];
          lookup = hist_vote[key];
          lookup = vote_type_hist[lookup];
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        }
      }),
      data6: TableCollection.extend({
        row_mapper: function(r) {
          var key, lookup;
          key = r[0] + ":" + r[1];
          lookup = hist_vote[key];
          lookup = vote_type_hist[lookup];
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        }
      }),
      data7: TableCollection.extend({
        row_mapper: function(r) {
          var key, lookup;
          key = r[0] + ":" + r[1];
          lookup = hist_vote[key];
          lookup = vote_type_hist[lookup];
          lookup = window.app.current_lang === 'en' ? lookup.en : lookup = lookup.fr;
          return [r[1], lookup].concat(r.slice(3));
        },
        render: function() {
          var table;
          $(this.el).append("<h1>" + this.title + "</h1>");
          table = new simpletable({
            data: this.rows,
            def: this.def
          });
          $(this.el).append(table.render().el);
          return this;
        }
      })
    };
    window.App = Backbone.View.extend({
      tabs_template: _.template($('#tabs_template').html()),
      org_select: function(event, data) {
        var args, def, el, id, key, les_tables, map_data_for_tabs, rendered, t, table, table_data, table_obj, tabs, title, to_render, _i, _len, _ref, _results;
        les_tables = window.les_tables;
        if (!_.isUndefined(this.source) && (!_.isUndefined(data) || !_.isUndefined(this.current_org))) {
          if (!_.isUndefined(data)) {
            this.current_org = this.source[data.item.value];
          }
          map_data_for_tabs = function(t) {
            var def, rtn;
            def = les_tables[t];
            rtn = {
              id: def.name.replace(" ", "_")
            };
            if (this.current_lang === 'en') {
              rtn.header = def.name;
            } else {
              rtn.header = def.nom;
            }
            return rtn;
          };
          to_render = _.map(_.keys(les_tables).sort(), map_data_for_tabs, this);
          rendered = this.tabs_template({
            tabs: to_render
          });
          t = $('#tabs').html(rendered);
          tabs = $('div.container', t).tabs();
          _ref = _.keys(les_tables).sort();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            def = les_tables[key];
            table_data = window.data[this.current_org][key];
            title = this.current_lang === "en" ? def.title_e || def.title_f : void 0;
            args = {
              lang: this.current_lang,
              data: table_data,
              def: def,
              title: title
            };
            table_obj = window.tables[key.toLowerCase()];
            table = new table_obj(args);
            id = def.name.replace(" ", "_");
            table.render();
            el = table.el;
            _results.push($('#' + id, tabs).append(el));
          }
          return _results;
        }
      },
      org_type_change: function(x) {
        if (x.target.value === "dept") {
          this.level = 'det';
          if (this.current_lang === 'en') {
            this.source = window.d_e;
          } else {
            this.source = window.d_f;
          }
        } else {
          this.level = 'min';
          if (this.current_lang === 'en') {
            this.source = window.m_f;
          } else {
            this.source = window.m_f;
          }
        }
        return this.input.autocomplete({
          source: _.keys(this.source),
          select: this.org_select
        });
      },
      lang_change: function(x) {
        if (x.target.value === "en") {
          this.set_english();
        } else {
          this.set_french();
        }
        return this.org.trigger("change");
      },
      set_english: function() {
        this.current_lang = 'en';
        this.lang.html($('#en_lang').html());
        return this.org.html($('#en_orgs').html());
      },
      set_french: function() {
        this.current_lang = 'fr';
        this.lang.html($('#fr_lang').html());
        return this.org.html($('#fr_orgs').html());
      },
      initialize: function() {
        _.bindAll(this);
        this.el = $('#app');
        this.input = $('#org_select', this.el);
        this.lang = $('#lang_select', this.el).change(this.lang_change).change(this.org_select);
        this.org = $('#org_type_select', this.el).change(this.org_type_change);
        return this.lang.trigger("change");
      },
      render: function() {
        return this;
      }
    });
    return window.app = new App();
  });
}).call(this);
