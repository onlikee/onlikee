<script setup lang="ts">
import { shallowRef } from 'vue'
import { PageLayout } from '../PageLayout'
import { PageHeader } from '../PageHeader'
import { Pagehead } from '../Pagehead'
import { Pagination } from '../Pagination'
import { Breadcrumbs } from '../Breadcrumbs'
import { UnderlineNav } from '../UnderlineNav'
import { NavList } from '../NavList'
import { ActionMenu } from '../ActionMenu'
import { ActionList } from '../ActionList'
import { Button } from '../Button'

const currentPage = shallowRef(1)
function changePage(event: MouseEvent, page: number) {
  event.preventDefault()
  currentPage.value = page
}
</script>

<template>
  <PageLayout container-width="full">
    <PageLayout.Header>
      <PageHeader has-border>
        <PageHeader.TitleArea :variant="{ narrow: 'medium', regular: 'large' }">
          <PageHeader.Title as="h1">Repository</PageHeader.Title>
        </PageHeader.TitleArea>
        <PageHeader.ContextArea>
          <PageHeader.Breadcrumbs>
            <Breadcrumbs>
              <Breadcrumbs.Item href="#organization">Organization</Breadcrumbs.Item>
              <Breadcrumbs.Item href="#repository" selected>Repository</Breadcrumbs.Item>
            </Breadcrumbs>
          </PageHeader.Breadcrumbs>
        </PageHeader.ContextArea>
        <PageHeader.Actions>
          <Button variant="primary">New issue</Button>
          <ActionMenu>
            <ActionMenu.Button id="composition-menu">Repository actions</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item>Copy repository URL</ActionList.Item>
                <ActionList.Item>Archive repository</ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </PageHeader.Actions>
        <PageHeader.Navigation>
          <UnderlineNav aria-label="Repository navigation">
            <UnderlineNav.Item href="#code" aria-current="page">Code</UnderlineNav.Item>
            <UnderlineNav.Item href="#issues">Issues</UnderlineNav.Item>
          </UnderlineNav>
        </PageHeader.Navigation>
      </PageHeader>
    </PageLayout.Header>
    <PageLayout.Content as="section" aria-label="Repository content">
      <Pagehead><h2>Repository files</h2></Pagehead>
      <p data-current-page>Page {{ currentPage }}</p>
    </PageLayout.Content>
    <PageLayout.Pane
      id="composition-pane"
      aria-label="Repository details"
      :hidden="{ narrow: true }"
      resizable
    >
      <NavList aria-label="Repository settings">
        <NavList.Item href="#general" aria-current="page">General</NavList.Item>
        <NavList.Item href="#access">Access</NavList.Item>
      </NavList>
    </PageLayout.Pane>
    <PageLayout.Footer>
      <Pagination
        :page-count="5"
        :current-page="currentPage"
        :show-pages="{ narrow: false }"
        @page-change="changePage"
      />
    </PageLayout.Footer>
  </PageLayout>
</template>
