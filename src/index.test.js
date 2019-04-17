/* eslint-env jest */

const Lrud = require('./index')

describe('lrud', () => {
  describe('registerNode()', () => {
    test('registering the very first registered node sets it to the root node', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', {
        selectAction: true
      })

      expect(navigation.rootNodeId).toEqual('root')
      expect(navigation.tree).toMatchObject({
        root: {
          selectAction: true
        }
      })
    })

    test('registering a node (after the root node) without a parent puts it under the root node', () => {
      const navigation = new Lrud()

      navigation.registerNode('alpha', { z: 1 })
      navigation.registerNode('beta', { x: 1 })
      navigation.registerNode('charlie', { x: 2 })

      expect(navigation.tree).toMatchObject({
        alpha: {
          z: 1,
          children: {
            beta: { x: 1 },
            charlie: { x: 2 }
          }
        }
      })
    })

    test('registering a node with a nested parent', () => {
      const navigation = new Lrud()

      navigation.registerNode('alpha', { a: 1 })
      navigation.registerNode('beta', { b: 2 })
      navigation.registerNode('charlie', { c: 3, parent: 'beta' })

      expect(navigation.tree).toMatchObject({
        alpha: {
          a: 1,
          children: {
            beta: {
              b: 2,
              parent: 'alpha',
              children: {
                charlie: { c: 3, parent: 'beta' }
              }
            }
          }
        }
      })
    })

    test('registering a node with a deeply nested parent', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('region-a', { parent: 'root' })
      navigation.registerNode('region-b', { parent: 'root' })
      navigation.registerNode('content-grid', { parent: 'region-b' })
      navigation.registerNode('PID-X', { parent: 'content-grid' })
      navigation.registerNode('PID-Y', { parent: 'content-grid' })
      navigation.registerNode('PID-Z', { parent: 'content-grid' })

      expect(navigation.tree).toMatchObject({
        root: {
          children: {
            'region-a': {
              parent: 'root'
            },
            'region-b': {
              parent: 'root',
              children: {
                'content-grid': {
                  parent: 'region-b',
                  children: {
                    'PID-X': {
                      parent: 'content-grid'
                    },
                    'PID-Y': {
                      parent: 'content-grid'
                    },
                    'PID-Z': {
                      parent: 'content-grid'
                    }
                  }
                }
              }
            }
          }
        }
      })
    })

    // reword this
    test('registering a new node with a parent that has no children sets its parent.activeChild to itself', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('alpha', { parent: 'root' })
      navigation.registerNode('beta', { parent: 'root' })
      navigation.registerNode('charlie', { parent: 'alpha' })
      navigation.registerNode('delta', { parent: 'charlie' })
      navigation.registerNode('echo', { parent: 'root' })

      // 'root' should have 3 children and its activeChild should be 'alpha'
      // 'alpha' should have 1 children and its activeChild should be 'charlie'
      // 'charlie' should have 1 children and its activeChild should be 'delta'

      expect(navigation.getNode('root').activeChild).toEqual('alpha')
      expect(navigation.getNode('alpha').activeChild).toEqual('charlie')
      expect(navigation.getNode('charlie').activeChild).toEqual('delta')
    })

    test('registering a node should add the index to the node', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a')

      navigation.registerNode('b')
      navigation.registerNode('b-1', { parent: 'b' })
      navigation.registerNode('b-2', { parent: 'b' })

      navigation.registerNode('c')

      expect(navigation.getNode('a').index).toEqual(1)
      expect(navigation.getNode('b').index).toEqual(2)
      expect(navigation.getNode('b-1').index).toEqual(1)
      expect(navigation.getNode('b-2').index).toEqual(2)
      expect(navigation.getNode('c').index).toEqual(3)
    })

    test('can chain registers together', () => {
      const navigation = new Lrud()

      navigation
        .registerNode('root')
        .registerNode('a')
        .registerNode('b')
        .registerNode('c')

      expect(navigation.tree).toMatchObject({
        root: {
          id: 'root',
          activeChild: 'a',
          children: {
            a: {
              id: 'a',
              parent: 'root',
              index: 1
            },
            b: {
              id: 'b',
              parent: 'root',
              index: 2
            },
            c: {
              id: 'c',
              parent: 'root',
              index: 3
            }
          }
        }
      })
    })
  })

  describe('getRootNode()', () => {
    test('return the root node', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')

      const node = navigation.getRootNode()

      expect(node.id).toEqual('root')
    })
  })

  describe('getNode()', () => {
    test('get a nested node with no children by id', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('region-a', { parent: 'root' })
      navigation.registerNode('region-b', { parent: 'root' })
      navigation.registerNode('content-grid', { parent: 'region-b' })
      navigation.registerNode('PID-X', { action: 1, parent: 'content-grid' })
      navigation.registerNode('PID-Y', { action: 2, parent: 'content-grid' })
      navigation.registerNode('PID-Z', { action: 3, parent: 'content-grid' })

      const node = navigation.getNode('PID-X')

      expect(node).toMatchObject({
        action: 1,
        parent: 'content-grid'
      })
    })

    test('get a nested node with children by id and make sure the entire tree comes with it', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('region-a', { parent: 'root' })
      navigation.registerNode('DEAD-X', { action: 1, parent: 'region-a' })
      navigation.registerNode('DEAD-Y', { action: 2, parent: 'region-a' })
      navigation.registerNode('DEAD-Z', { action: 3, parent: 'region-a' })
      navigation.registerNode('region-b', { parent: 'root' })
      navigation.registerNode('content-grid', { parent: 'region-b' })
      navigation.registerNode('PID-X', { action: 1, parent: 'content-grid' })
      navigation.registerNode('PID-Y', { action: 2, parent: 'content-grid' })
      navigation.registerNode('PID-Z', { action: 3, parent: 'content-grid' })

      const node = navigation.getNode('region-b')

      expect(node).toMatchObject({
        parent: 'root',
        children: {
          'content-grid': {
            parent: 'region-b',
            children: {
              'PID-X': {
                parent: 'content-grid'
              },
              'PID-Y': {
                parent: 'content-grid'
              },
              'PID-Z': {
                parent: 'content-grid'
              }
            }
          }
        }
      })
    })
  })

  describe('unregisterNode()', () => {
    test('unregistering a leaf should remove it (set it to undefined)', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('NODE_A', { isFocusable: true })
      navigation.registerNode('NODE_B', { isFocusable: true })

      navigation.unregisterNode('NODE_A')

      expect(navigation.tree).toMatchObject({
        root: {
          children: {
            NODE_B: {
              isFocusable: true,
              index: 2,
              parent: 'root'
            }
          }
        }
      })

      expect(navigation.getNode('NODE_A')).toEqual(undefined)

      expect(navigation.nodePathList).toEqual([
        'root',
        'root.children.NODE_B'
      ])
    })

    test('unregister a whole branch', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { selectAction: 1 })
      navigation.registerNode('BOX_A', { selectAction: 2 })
      navigation.registerNode('BOX_B', { selectAction: 3 })
      navigation.registerNode('NODE_1', { selectAction: 11, parent: 'BOX_A' })
      navigation.registerNode('NODE_2', { selectAction: 12, parent: 'BOX_A' })
      navigation.registerNode('NODE_3', { selectAction: 13, parent: 'BOX_A' })
      navigation.registerNode('NODE_4', { selectAction: 24, parent: 'BOX_B' })
      navigation.registerNode('NODE_5', { selectAction: 25, parent: 'BOX_B' })
      navigation.registerNode('NODE_6', { selectAction: 26, parent: 'BOX_B' })

      navigation.unregisterNode('BOX_B')

      expect(navigation.tree).toMatchObject({
        root: {
          selectAction: 1,
          children: {
            BOX_A: {
              selectAction: 2,
              parent: 'root',
              children: {
                NODE_1: {
                  selectAction: 11,
                  parent: 'BOX_A'
                },
                NODE_2: {
                  selectAction: 12,
                  parent: 'BOX_A'
                },
                NODE_3: {
                  selectAction: 13,
                  parent: 'BOX_A'
                }
              }
            }
          }
        }
      })

      expect(navigation.getNode('BOX_B')).toEqual(undefined)

      expect(navigation.nodePathList).toEqual([
        'root',
        'root.children.BOX_A',
        'root.children.BOX_A.children.NODE_1',
        'root.children.BOX_A.children.NODE_2',
        'root.children.BOX_A.children.NODE_3'
      ])
    })

    test('if unregistering the focused node, reassign focus (focused on the node were unregistering)', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('NODE_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('NODE_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('NODE_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('NODE_3')

      navigation.unregisterNode('NODE_3')

      expect(navigation.currentFocusNodeId).toEqual('NODE_1')
    })

    test('if unregistering the focused node, set focus to undefined (focused on a nested node of the unregistered node)', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('BOX_A', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('BOX_B', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('NODE_1', { parent: 'BOX_A', isFocusable: true })
      navigation.registerNode('NODE_2', { parent: 'BOX_A', isFocusable: true })
      navigation.registerNode('NODE_3', { parent: 'BOX_B', isFocusable: true })
      navigation.registerNode('NODE_4', { parent: 'BOX_B', isFocusable: true })

      // so we're focused on the first element of the left pane
      // and we unregister the entire left pane
      // so focus should go to the first element of the right pane
      navigation.assignFocus('NODE_1')
      navigation.unregisterNode('BOX_A')

      expect(navigation.currentFocusNodeId).toEqual('NODE_3')
    })

    test('unregistering a node should trigger a `blur` event with that node', () => {
      const navigation = new Lrud()
      const spy = jest.fn()
      navigation.on('blur', spy)
      navigation.registerNode('root')
      navigation.registerNode('BOX_A', { parent: 'root' })
      navigation.registerNode('BOX_B', { parent: 'root' })
      navigation.registerNode('NODE_1', { parent: 'BOX_A' })
      navigation.registerNode('NODE_2', { parent: 'BOX_A' })
      navigation.registerNode('NODE_3', { parent: 'BOX_A' })
      navigation.registerNode('NODE_4', { parent: 'BOX_B' })
      navigation.registerNode('NODE_5', { parent: 'BOX_B' })
      navigation.registerNode('NODE_6', { parent: 'BOX_B' })

      navigation.unregisterNode('BOX_B')

      expect(navigation.tree).toMatchObject({
        root: {
          id: 'root',
          children: {
            BOX_A: {
              id: 'BOX_A',
              index: 1,
              parent: 'root',
              children: {
                NODE_1: {
                  id: 'NODE_1',
                  index: 1,
                  parent: 'BOX_A'
                },
                NODE_2: {
                  id: 'NODE_2',
                  index: 2,
                  parent: 'BOX_A'
                },
                NODE_3: {
                  id: 'NODE_3',
                  index: 3,
                  parent: 'BOX_A'
                }
              }
            }
          }
        }
      })

      // should trigger with the details of BOX_B
      expect(spy).toHaveBeenCalledWith({
        parent: 'root',
        id: 'BOX_B',
        index: 2,
        activeChild: 'NODE_4',
        children: {
          NODE_4: {
            id: 'NODE_4',
            index: 1,
            parent: 'BOX_B'
          },
          NODE_5: {
            id: 'NODE_5',
            index: 2,
            parent: 'BOX_B'
          },
          NODE_6: {
            id: 'NODE_6',
            index: 3,
            parent: 'BOX_B'
          }
        }
      })
    })

    test('unregistering a branch with only 1 leaf should reset focus properly one level up', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('a', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('b', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('a-1', { parent: 'a', isFocusable: true })
      navigation.registerNode('a-2', { parent: 'a', isFocusable: true })
      navigation.registerNode('a-3', { parent: 'a', isFocusable: true })
      navigation.registerNode('b-1', { parent: 'b', isFocusable: true })

      navigation.assignFocus('b-1')

      navigation.unregisterNode('b')

      // so now we should be focused on `a-1`, as its the first relevant thing to be focused on

      expect(navigation.currentFocusNodeId).toEqual('a-1')
    })

    test('unregistering the only leaf of a long line of single branches should reset focus properly [fig-4]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('a', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('a-1', { parent: 'a', isFocusable: true })

      navigation.registerNode('b', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('c', { parent: 'b', orientation: 'vertical' })
      navigation.registerNode('d', { parent: 'c', orientation: 'vertical' })
      navigation.registerNode('e', { parent: 'd', orientation: 'vertical' })
      navigation.registerNode('e-1', { parent: 'e', isFocusable: true })

      navigation.assignFocus('e-1')

      navigation.unregisterNode('e-1')

      // we have to dig up to the first thing that has children, and then dig down for the next child
      // so basically our focus should now be on `a-1`

      expect(navigation.currentFocusNodeId).toEqual('a-1')
    })
  })

  describe('isDirectionAndOrientationMatching()', () => {
    const navigation = new Lrud()
    test('vertical and up is true', () => {
      expect(navigation.isDirectionAndOrientationMatching('vertical', 'up')).toEqual(true)
    })
    test('vertical and down is true', () => {
      expect(navigation.isDirectionAndOrientationMatching('vertical', 'down')).toEqual(true)
    })
    test('horizontal and left is true', () => {
      expect(navigation.isDirectionAndOrientationMatching('horizontal', 'left')).toEqual(true)
    })
    test('horizontal and right is true', () => {
      expect(navigation.isDirectionAndOrientationMatching('horizontal', 'right')).toEqual(true)
    })
    test('vertical and left is false', () => {
      expect(navigation.isDirectionAndOrientationMatching('vertical', 'left')).toEqual(false)
    })
    test('vertical and right is false', () => {
      expect(navigation.isDirectionAndOrientationMatching('vertical', 'right')).toEqual(false)
    })
    test('horizontal and up is false', () => {
      expect(navigation.isDirectionAndOrientationMatching('horizontal', 'up')).toEqual(false)
    })
    test('horizontal and down is false', () => {
      expect(navigation.isDirectionAndOrientationMatching('horizontal', 'down')).toEqual(false)
    })
  })

  describe('pickNode()', () => {
    test('pick a nested node', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { selectAction: 1 })
      navigation.registerNode('BOX_A', { selectAction: 2 })
      navigation.registerNode('NODE_1', { selectAction: 11, parent: 'BOX_A' })
      navigation.registerNode('NODE_2', { selectAction: 12, parent: 'BOX_A' })
      navigation.registerNode('NODE_3', { selectAction: 13, parent: 'BOX_A' })

      const node2 = navigation.pickNode('NODE_2')

      expect(node2).toMatchObject({ selectAction: 12, parent: 'BOX_A' })
      expect(navigation.tree).toMatchObject({
        root: {
          selectAction: 1,
          children: {
            BOX_A: {
              selectAction: 2,
              parent: 'root',
              children: {
                NODE_1: {
                  selectAction: 11,
                  parent: 'BOX_A'
                },
                NODE_3: {
                  selectAction: 13,
                  parent: 'BOX_A'
                }
              }
            }
          }
        }
      })
    })
  })

  describe('_isFocusableNode()', () => {
    test('returns true for a node with a select action (`selectAction`)', () => {
      const node = { selectAction: true, parent: 'root' }
      const navigation = new Lrud()

      expect(navigation._isFocusableNode(node)).toEqual(true)
    })

    test('returns true for a node with is focusable (`isFocusable`)', () => {
      const node = { isFocusable: true, parent: 'root' }
      const navigation = new Lrud()

      expect(navigation._isFocusableNode(node)).toEqual(true)
    })

    test('returns false for a node with neither', () => {
      const node = { parent: 'root' }
      const navigation = new Lrud()

      expect(navigation._isFocusableNode(node)).toEqual(false)
    })
  })

  describe('assignFocus()', () => {
    test('assigning focus should set the `activeChild` of all the nodes back up the tree', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('region-a', { parent: 'root' })
      navigation.registerNode('region-b', { parent: 'root' })
      navigation.registerNode('content-grid', { parent: 'region-b' })
      navigation.registerNode('PID-X', { selectAction: 1, parent: 'content-grid' })
      navigation.registerNode('PID-Y', { selectAction: 2, parent: 'content-grid' })
      navigation.registerNode('PID-Z', { selectAction: 3, parent: 'content-grid' })

      navigation.assignFocus('PID-Y')

      expect(navigation.getNode('content-grid').activeChild).toEqual('PID-Y')
      expect(navigation.getNode('region-b').activeChild).toEqual('content-grid')
      expect(navigation.getNode('root').activeChild).toEqual('region-b')
    })

    test('assigning focus should set the currentFocusNodeId of the instance', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { parent: 'root', isFocusable: true })
      navigation.registerNode('b', { parent: 'root', isFocusable: true })
      navigation.registerNode('c', { parent: 'root', isFocusable: true })

      navigation.assignFocus('b')

      expect(navigation.currentFocusNodeId).toEqual('b')
      expect(navigation.getNode('root').activeChild).toEqual('b')
    })
  })

  describe('climbUp()', () => {
    test('scan up the tree 1 level', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('BOX_A', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('BOX_B', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('NODE_1', { parent: 'BOX_B', isFocusable: true })
      navigation.registerNode('NODE_2', { parent: 'BOX_B', isFocusable: true })
      navigation.registerNode('NODE_3', { parent: 'BOX_B', isFocusable: true })

      navigation.assignFocus('NODE_2')

      const nextActionableNode = navigation.climbUp(navigation.getNode('NODE_2'), 'right')

      expect(nextActionableNode.id).toEqual('BOX_B')
    })

    test('scan up the tree 2 levels', () => {
      const navigation = new Lrud()
      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('page', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('BOX_A', { parent: 'page', orientation: 'vertical' })
      navigation.registerNode('BOX_B', { parent: 'page', orientation: 'vertical' })
      navigation.registerNode('NODE_1', { parent: 'BOX_A', isFocusable: true })
      navigation.registerNode('NODE_2', { parent: 'BOX_A', isFocusable: true })
      navigation.registerNode('NODE_3', { parent: 'BOX_A', isFocusable: true })
      navigation.registerNode('NODE_4', { parent: 'BOX_B', isFocusable: true })
      navigation.registerNode('NODE_5', { parent: 'BOX_B', isFocusable: true })
      navigation.registerNode('NODE_6', { parent: 'BOX_B', isFocusable: true })

      navigation.assignFocus('NODE_1')

      const nextActionableNode = navigation.climbUp(navigation.getNode('NODE_1'), 'right')

      // the parent of NODE_1 is BOX_A but we couldn't dig up to that because it was horizontal
      // and the next thing that was horizontal was the page
      expect(nextActionableNode.id).toEqual('page')
    })
  })

  describe('getNextChildInDirection()', () => {
    test('with no order values, get the next child of a node', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('alpha', { id: 'alpha', parent: 'root', isFocusable: true })
      navigation.registerNode('beta', { id: 'beta', parent: 'root', isFocusable: true })
      navigation.registerNode('charlie', { id: 'charlie', parent: 'root', isFocusable: true })

      // default active child of 'root' is 'alpha'
      let nextChild = navigation.getNextChildInDirection(navigation.getNode('root'), 'right')

      expect(nextChild.id).toEqual('beta')

      // so then we assign focus to 'beta' and go again
      navigation.assignFocus('beta')
      nextChild = navigation.getNextChildInDirection(navigation.getNode('root'), 'right')

      expect(nextChild.id).toEqual('charlie')
    })

    test('with no order values, if the activeChild is the last child, just return that', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('alpha', { id: 'alpha', parent: 'root', isFocusable: true })
      navigation.registerNode('beta', { id: 'beta', parent: 'root', isFocusable: true })
      navigation.registerNode('charlie', { id: 'charlie', parent: 'root', isFocusable: true })

      navigation.assignFocus('charlie')

      // we're already focused on the last child of root, so it should return that
      let nextChild = navigation.getNextChildInDirection(navigation.getNode('root'), 'right')
      expect(nextChild.id).toEqual('charlie')
    })

    test('horizontal list, direction: right', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('a')
      navigation.registerNode('b')
      navigation.registerNode('c')

      const child = navigation.getNextChildInDirection(navigation.getNode('root'), 'right')

      expect(child.id).toEqual('b')
    })

    test('horizontal list, direction: left', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('a', { isFocusable: true })
      navigation.registerNode('b', { isFocusable: true })
      navigation.registerNode('c', { isFocusable: true })

      navigation.assignFocus('b')

      const child = navigation.getNextChildInDirection(navigation.getNode('root'), 'left')

      expect(child.id).toEqual('a')
    })

    test('vertical list, direction: down', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('a')
      navigation.registerNode('b')
      navigation.registerNode('c')

      const child = navigation.getNextChildInDirection(navigation.getNode('root'), 'down')

      expect(child.id).toEqual('b')
    })

    test('vertical list, direction: up', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('a', { isFocusable: true })
      navigation.registerNode('b', { isFocusable: true })
      navigation.registerNode('c', { isFocusable: true })

      navigation.assignFocus('b')

      const child = navigation.getNextChildInDirection(navigation.getNode('root'), 'up')

      expect(child.id).toEqual('a')
    })
  })

  describe('digDown()', () => {
    test('dig down 2 levels', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })

      navigation.registerNode('left_column', { parent: 'root', orientation: 'vertical' })
      navigation.registerNode('right_column', { parent: 'root', orientation: 'vertical' })

      navigation.registerNode('NODE_A', { id: 'NODE_A', parent: 'left_column', isFocusable: true })
      navigation.registerNode('NODE_B', { id: 'NODE_B', parent: 'left_column', isFocusable: true })

      navigation.registerNode('NODE_C', { id: 'NODE_C', parent: 'right_column', isFocusable: true })
      navigation.registerNode('NODE_D', { id: 'NODE_D', parent: 'right_column', isFocusable: true })

      // first focusable of 'root' should be 'NODE_A'
      const root = navigation.getNode('root')
      const focusable = navigation.digDown(root)
      expect(focusable.id).toEqual('NODE_A')
    })
  })

  describe('getNextChild()', () => {
    test('get the next child when children were added without indexes', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { isFocusable: true })
      navigation.registerNode('b', { isFocusable: true })
      navigation.registerNode('c', { isFocusable: true })
      navigation.registerNode('d', { isFocusable: true })

      navigation.assignFocus('b')

      const root = navigation.getNode('root')

      expect(navigation.getNextChild(root).id).toEqual('c')
    })

    test('get the next child when children were added with indexes, out of order', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 2, isFocusable: true })
      navigation.registerNode('b', { index: 4, isFocusable: true })
      navigation.registerNode('c', { index: 3, isFocusable: true })
      navigation.registerNode('d', { index: 1, isFocusable: true })

      navigation.assignFocus('d')

      const root = navigation.getNode('root')

      expect(navigation.getNextChild(root).id).toEqual('a')
    })

    test('if node is already focused on the last child, regardless of index, return that child', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 2, isFocusable: true })
      navigation.registerNode('b', { index: 4, isFocusable: true })
      navigation.registerNode('c', { index: 3, isFocusable: true })
      navigation.registerNode('d', { index: 1, isFocusable: true })

      navigation.assignFocus('b')

      const root = navigation.getNode('root')

      expect(navigation.getNextChild(root).id).toEqual('b')
    })
  })

  describe('getPrevChild()', () => {
    test('get the prev child when children were added without indexes', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { isFocusable: true })
      navigation.registerNode('b', { isFocusable: true })
      navigation.registerNode('c', { isFocusable: true })
      navigation.registerNode('d', { isFocusable: true })

      navigation.assignFocus('c')

      const root = navigation.getNode('root')

      expect(navigation.getPrevChild(root).id).toEqual('b')
    })

    test('get the prev child when children were added with indexes, out of order', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 2, isFocusable: true })
      navigation.registerNode('b', { index: 4, isFocusable: true })
      navigation.registerNode('c', { index: 3, isFocusable: true })
      navigation.registerNode('d', { index: 1, isFocusable: true })

      navigation.assignFocus('b')

      const root = navigation.getNode('root')

      expect(navigation.getPrevChild(root).id).toEqual('c')
    })

    test('if node is already focused on the first child, regardless of index, return that child', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 2, isFocusable: true })
      navigation.registerNode('b', { index: 4, isFocusable: true })
      navigation.registerNode('c', { index: 3, isFocusable: true })
      navigation.registerNode('d', { index: 1, isFocusable: true })

      navigation.assignFocus('d')

      const root = navigation.getNode('root')

      expect(navigation.getPrevChild(root).id).toEqual('d')
    })
  })

  describe('getNodeFirstChild()', () => {
    test('should return child with index of 1 - added without indexes', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a')
      navigation.registerNode('b')
      navigation.registerNode('c')

      const root = navigation.getNode('root')

      expect(navigation.getNodeFirstChild(root).id).toEqual('a')
    })

    test('should return child with index of 1 - added out of order, with indexes', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 2 })
      navigation.registerNode('b', { index: 1 })
      navigation.registerNode('c', { index: 3 })

      const root = navigation.getNode('root')

      expect(navigation.getNodeFirstChild(root).id).toEqual('b')
    })
  })

  describe('getNodeLastChild()', () => {
    test('should return child with last index - added without indexes', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a')
      navigation.registerNode('b')
      navigation.registerNode('c')

      const root = navigation.getNode('root')

      expect(navigation.getNodeLastChild(root).id).toEqual('c')
    })

    test('should return child with last index - added with indexes, out of order', () => {
      const navigation = new Lrud()

      navigation.registerNode('root')
      navigation.registerNode('a', { index: 3 })
      navigation.registerNode('b', { index: 1 })
      navigation.registerNode('c', { index: 2 })

      const root = navigation.getNode('root')

      expect(navigation.getNodeLastChild(root).id).toEqual('a')
    })
  })

  describe('handleKeyEvent()', () => {
    test('simple horizontal list - move to a sibling', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_1')

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_2')
    })

    test('already focused on the last sibling, and no more branches - leave focus where it is', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_3')

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_3')
    })

    test('already focused on the last sibling, but the parent wraps - focus needs to go to the first sibling', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal', isWrapping: true })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_3')

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_1')
    })

    test('already focused on the first sibling, but the parent wraps - focus needs to go to the last sibling', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal', isWrapping: true })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_1')

      navigation.handleKeyEvent({ direction: 'left' })

      expect(navigation.currentFocusNodeId).toEqual('child_3')
    })

    test('moving across a simple horizontal list twice - fire focus events', () => {
      const navigation = new Lrud()
      const spy = jest.fn()
      navigation.on('focus', spy)
      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_1')

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_2')

      expect(spy).toHaveBeenCalledWith({
        parent: 'root',
        index: 2,
        id: 'child_2',
        isFocusable: true
      })

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_3')

      expect(spy).toHaveBeenCalledWith({
        parent: 'root',
        id: 'child_3',
        index: 3,
        isFocusable: true
      })
    })

    test('moving across a simple horizontal list, forwards then backwards - fire focus events', () => {
      const navigation = new Lrud()
      const spy = jest.fn()
      navigation.on('focus', spy)
      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('child_1', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_2', { parent: 'root', isFocusable: true })
      navigation.registerNode('child_3', { parent: 'root', isFocusable: true })

      navigation.assignFocus('child_1')

      navigation.handleKeyEvent({ direction: 'right' })

      expect(navigation.currentFocusNodeId).toEqual('child_2')

      expect(spy).toHaveBeenCalledWith({
        parent: 'root',
        id: 'child_2',
        index: 2,
        isFocusable: true
      })

      navigation.handleKeyEvent({ direction: 'left' })

      expect(navigation.currentFocusNodeId).toEqual('child_1')

      expect(spy).toHaveBeenCalledWith({
        parent: 'root',
        id: 'child_1',
        index: 1,
        isFocusable: true
      })
    })

    test('should jump between activeChild for 2 vertical panes side-by-side', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'horizontal' })
      navigation.registerNode('l', { orientation: 'vertical' })
      navigation.registerNode('l-1', { parent: 'l', isFocusable: true })
      navigation.registerNode('l-2', { parent: 'l', isFocusable: true })
      navigation.registerNode('l-3', { parent: 'l', isFocusable: true })
      navigation.registerNode('r', { orientation: 'vertical' })
      navigation.registerNode('r-1', { parent: 'r', isFocusable: true })
      navigation.registerNode('r-2', { parent: 'r', isFocusable: true })
      navigation.registerNode('r-3', { parent: 'r', isFocusable: true })

      navigation.assignFocus('l-2')

      // go down one...
      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('l-3')

      // jump across to right pane, first focusable...
      navigation.handleKeyEvent({ direction: 'right' })
      expect(navigation.currentFocusNodeId).toEqual('r-1')

      // go down one...
      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('r-2')

      // go back left again...
      navigation.handleKeyEvent({ direction: 'left' })
      expect(navigation.currentFocusNodeId).toEqual('l-3')
    })
  })

  describe('handleKeyEvent() - column alignment behaviour', () => {
    test('moving between two rows should keep column alignment [fig-1]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical', isIndexAlign: true })
      navigation.registerNode('row-1', { orientation: 'horizontal' })
      navigation.registerNode('row-1-col-1', { parent: 'row-1', isFocusable: true })
      navigation.registerNode('row-1-col-2', { parent: 'row-1', isFocusable: true })
      navigation.registerNode('row-2', { orientation: 'horizontal' })
      navigation.registerNode('row-2-col-1', { parent: 'row-2', isFocusable: true })
      navigation.registerNode('row-2-col-2', { parent: 'row-2', isFocusable: true })
      navigation.assignFocus('row-1-col-2')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('row-2-col-2')
    })

    test('moving between 2 vertical wrappers inside a vertical wrapper [fig-3]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical' })
      navigation.registerNode('list-a', { orientation: 'vertical' })
      navigation.registerNode('list-a-box-1', { parent: 'list-a', isFocusable: true })
      navigation.registerNode('list-a-box-2', { parent: 'list-a', isFocusable: true })
      navigation.registerNode('list-a-box-3', { parent: 'list-a', isFocusable: true })

      navigation.registerNode('list-b', { orientation: 'vertical' })
      navigation.registerNode('list-b-box-1', { parent: 'list-b', isFocusable: true })
      navigation.registerNode('list-b-box-2', { parent: 'list-b', isFocusable: true })
      navigation.registerNode('list-b-box-3', { parent: 'list-b', isFocusable: true })

      navigation.assignFocus('list-a-box-1')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('list-a-box-2')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('list-a-box-3')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('list-b-box-1')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('list-b-box-2')
    })

    test('column alignment between 2 higher level grid wrappers [fig-2]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical', isVerticalIndexAlign: true })

      // grid a
      navigation.registerNode('grid-a', { parent: 'root', orientation: 'vertical', isVerticalIndexAlign: true })
      navigation.registerNode('grid-a-row-1', { parent: 'grid-a', orientation: 'horizontal' })
      navigation.registerNode('grid-a-row-1-col-1', { parent: 'grid-a-row-1', isFocusable: true })
      navigation.registerNode('grid-a-row-1-col-2', { parent: 'grid-a-row-1', isFocusable: true })
      navigation.registerNode('grid-a-row-2', { parent: 'grid-a', orientation: 'horizontal' })
      navigation.registerNode('grid-a-row-2-col-1', { parent: 'grid-a-row-2', isFocusable: true })
      navigation.registerNode('grid-a-row-2-col-2', { parent: 'grid-a-row-2', isFocusable: true })

      // grid-b
      navigation.registerNode('grid-b', { parent: 'root', orientation: 'vertical', isVerticalIndexAlign: true })
      navigation.registerNode('grid-b-row-1', { parent: 'grid-b', orientation: 'horizontal' })
      navigation.registerNode('grid-b-row-1-col-1', { parent: 'grid-b-row-1', isFocusable: true })
      navigation.registerNode('grid-b-row-1-col-2', { parent: 'grid-b-row-1', isFocusable: true })
      navigation.registerNode('grid-b-row-2', { parent: 'grid-b', orientation: 'horizontal' })
      navigation.registerNode('grid-b-row-2-col-1', { parent: 'grid-b-row-2', isFocusable: true })
      navigation.registerNode('grid-b-row-2-col-2', { parent: 'grid-b-row-2', isFocusable: true })

      navigation.assignFocus('grid-a-row-1-col-1')

      navigation.handleKeyEvent({ direction: 'right' })
      expect(navigation.currentFocusNodeId).toEqual('grid-a-row-1-col-2')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('grid-a-row-2-col-2')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('grid-b-row-1-col-2')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('grid-b-row-2-col-2')
    })
  })

  describe('handleKeyEvent() - index ranges', () => {
    test('2 rows, second row has index range [fig-5]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical', isVerticalIndexAlign: true })
      navigation.registerNode('row-a', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('row-a-box-1', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-2', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-3', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-4', { parent: 'row-a', isFocusable: true })

      navigation.registerNode('row-b', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('row-b-box-1', { parent: 'row-b', indexRange: [1, 2], isFocusable: true })
      navigation.registerNode('row-b-box-2', { parent: 'row-b', indexRange: [3, 4], isFocusable: true })

      navigation.assignFocus('row-a-box-2')

      // so we go down from the 2nd to land on the 1st of the 2nd row...
      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('row-b-box-1')

      // ...should go back up to the first item in the index range array
      navigation.handleKeyEvent({ direction: 'up' })
      expect(navigation.currentFocusNodeId).toEqual('row-a-box-1')

      // ...3 rights put us at the last item of row 1
      navigation.handleKeyEvent({ direction: 'right' })
      navigation.handleKeyEvent({ direction: 'right' })
      navigation.handleKeyEvent({ direction: 'right' })
      expect(navigation.currentFocusNodeId).toEqual('row-a-box-4')

      // ...down one puts us on the 2nd item of the 2nd row
      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('row-b-box-2')

      // ...and an up puts us on the 3rd item (as thats the index start) of the 1st row
      navigation.handleKeyEvent({ direction: 'up' })
      expect(navigation.currentFocusNodeId).toEqual('row-a-box-3')
    })

    test('1 row of 6, 2nd row has uneven index ranges [fig-6]', () => {
      const navigation = new Lrud()

      navigation.registerNode('root', { orientation: 'vertical', isVerticalIndexAlign: true })
      navigation.registerNode('row-a', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('row-a-box-1', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-2', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-3', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-4', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-5', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-a-box-6', { parent: 'row-a', isFocusable: true })
      navigation.registerNode('row-b', { parent: 'root', orientation: 'horizontal' })
      navigation.registerNode('row-b-box-1', { parent: 'row-b', indexRange: [1, 2], isFocusable: true })
      navigation.registerNode('row-b-box-2', { parent: 'row-b', indexRange: [3, 6], isFocusable: true })
      navigation.assignFocus('row-a-box-6')

      navigation.handleKeyEvent({ direction: 'down' })
      expect(navigation.currentFocusNodeId).toEqual('row-b-box-2')

      navigation.handleKeyEvent({ direction: 'up' })
      expect(navigation.currentFocusNodeId).toEqual('row-a-box-3')
    })
  })
})
