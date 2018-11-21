// [{
//   id: ,
//   name: '',
//   room:
// }]

// addUser(id, name, room)
// removeUser(id)
// getUser(id)
// getUserList(room)
// addPoint(id)

class Users {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room) {
    var user = { id, name, room, admin: this.users.length === 0, points: 0 };
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    var user = this.users.filter((user) => user.id === id)[0];

    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }
  getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
  }
  getUserList(room) {
    return this.users.filter((user) => user.room === room);
  }
  addPoint(id, limit, taken) {
    const user = this.users.filter((user) => user.id === id)[0];
    user.points += limit + taken;
    return user;
  }
}

module.exports = { Users };
